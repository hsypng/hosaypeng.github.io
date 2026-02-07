#!/usr/bin/env python3
"""Bulk-edit habits in good_habits.md: add, remove, or rename."""

import argparse
import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
REPO_DIR = SCRIPT_DIR.parent
VAULT_DIR = REPO_DIR.parent

DATE_RE = re.compile(r"^### (\d{4}-\d{2}-\d{2})")
CATEGORY_RE = re.compile(r"^\*\*(.+?)\*\*$")
CHECKBOX_RE = re.compile(r"^- \[([ xX])\] (.+)$")


def find_habits_file() -> Path:
  """Find good_habits.md by searching the vault."""
  for match in VAULT_DIR.rglob("good_habits.md"):
    if ".trash" not in match.parts:
      return match
  print(f"Error: good_habits.md not found in {VAULT_DIR}")
  raise SystemExit(1)


def add_habit(lines: list[str], category: str, habit: str) -> int:
  """Insert a new unchecked habit under the given category in every entry."""
  modified = 0
  result = []
  in_target_category = False
  has_date = False

  for i, line in enumerate(lines):
    stripped = line.rstrip("\n")

    if DATE_RE.match(stripped.strip()):
      # Flush pending add at EOF of previous category
      if in_target_category and has_date:
        result.append(f"- [ ] {habit}\n")
        modified += 1
        in_target_category = False
      has_date = True
      result.append(line)
      continue

    cat_match = CATEGORY_RE.match(stripped.strip())
    if cat_match and has_date:
      if in_target_category:
        # Next category starts — insert before it
        result.append(f"- [ ] {habit}\n")
        modified += 1
        in_target_category = False
      if cat_match.group(1) == category:
        in_target_category = True
      result.append(line)
      continue

    result.append(line)

  # Handle last entry if it ends in the target category
  if in_target_category and has_date:
    # Ensure trailing newline before appending
    if result and result[-1].strip() != "":
      result.append("\n")
    result.append(f"- [ ] {habit}\n")
    modified += 1

  lines.clear()
  lines.extend(result)
  return modified


def remove_habit(lines: list[str], habit: str) -> int:
  """Remove all checkbox lines matching the habit name."""
  modified = 0
  result = []

  for line in lines:
    stripped = line.rstrip("\n").strip()
    m = CHECKBOX_RE.match(stripped)
    if m and m.group(2) == habit:
      modified += 1
      continue
    result.append(line)

  lines.clear()
  lines.extend(result)
  return modified


def rename_habit(lines: list[str], old_name: str, new_name: str) -> int:
  """Rename a habit across all entries, preserving checked state."""
  modified = 0
  result = []

  for line in lines:
    stripped = line.rstrip("\n").strip()
    m = CHECKBOX_RE.match(stripped)
    if m and m.group(2) == old_name:
      state = m.group(1)
      result.append(f"- [{state}] {new_name}\n")
      modified += 1
    else:
      result.append(line)

  lines.clear()
  lines.extend(result)
  return modified


def get_categories(lines: list[str]) -> set[str]:
  """Extract all category names from the file."""
  cats = set()
  for line in lines:
    m = CATEGORY_RE.match(line.strip())
    if m:
      cats.add(m.group(1))
  return cats


def main():
  parser = argparse.ArgumentParser(description="Bulk-edit habits in good_habits.md")
  parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing")
  sub = parser.add_subparsers(dest="command", required=True)

  add_p = sub.add_parser("add", help="Add a new habit under a category")
  add_p.add_argument("category", help="Category name (e.g. Diet, Exercise)")
  add_p.add_argument("habit", help="Habit name to add")

  rm_p = sub.add_parser("remove", help="Remove a habit from all entries")
  rm_p.add_argument("habit", help="Habit name to remove")

  ren_p = sub.add_parser("rename", help="Rename a habit across all entries")
  ren_p.add_argument("old_name", help="Current habit name")
  ren_p.add_argument("new_name", help="New habit name")

  args = parser.parse_args()

  habits_file = find_habits_file()
  print(f"File: {habits_file}")

  lines = habits_file.read_text(encoding="utf-8").splitlines(keepends=True)

  if args.command == "add":
    categories = get_categories(lines)
    if args.category not in categories:
      print(f"Error: category '{args.category}' not found.")
      print(f"Available: {', '.join(sorted(categories))}")
      raise SystemExit(1)
    count = add_habit(lines, args.category, args.habit)
    action = f"Added '{args.habit}' under '{args.category}'"

  elif args.command == "remove":
    count = remove_habit(lines, args.habit)
    action = f"Removed '{args.habit}'"

  elif args.command == "rename":
    count = rename_habit(lines, args.old_name, args.new_name)
    action = f"Renamed '{args.old_name}' -> '{args.new_name}'"

  if count == 0:
    print("No matching entries found. Nothing to change.")
    raise SystemExit(0)

  print(f"{action} in {count} entries")

  if args.dry_run:
    print("(dry run — no file modified)")
  else:
    habits_file.write_text("".join(lines), encoding="utf-8")
    print(f"Written to {habits_file}")


if __name__ == "__main__":
  main()

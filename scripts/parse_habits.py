#!/usr/bin/env python3
"""Parse good_habits.md checkboxes into habits.json for Jekyll."""

import json
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
REPO_DIR = SCRIPT_DIR.parent
VAULT_DIR = REPO_DIR.parent

HABITS_MD = VAULT_DIR / "00_Inbox" / "good_habits.md"
OUTPUT_JSON = REPO_DIR / "_data" / "habits.json"

# Add habit names here to hide their individual heatmaps
# They'll still count toward the rollup total
PRIVATE_HABITS = []

DATE_RE = re.compile(r"^### (\d{4}-\d{2}-\d{2})")
CATEGORY_RE = re.compile(r"^\*\*(.+?)\*\*")
CHECKED_RE = re.compile(r"^- \[x\] (.+)", re.IGNORECASE)
UNCHECKED_RE = re.compile(r"^- \[ \] (.+)")


def parse_habits(text: str) -> dict:
  days = {}
  categories = {}  # category -> [habit_names]
  current_date = None
  current_category = None

  for line in text.splitlines():
    line = line.strip()

    date_match = DATE_RE.match(line)
    if date_match:
      current_date = date_match.group(1)
      current_category = None
      if current_date not in days:
        days[current_date] = {}
      continue

    cat_match = CATEGORY_RE.match(line)
    if cat_match:
      current_category = cat_match.group(1)
      if current_date and current_category not in days[current_date]:
        days[current_date][current_category] = {}
      if current_category not in categories:
        categories[current_category] = []
      continue

    if current_date and current_category:
      checked = CHECKED_RE.match(line)
      unchecked = UNCHECKED_RE.match(line)
      if checked:
        habit_name = checked.group(1)
        days[current_date][current_category][habit_name] = True
        if habit_name not in categories[current_category]:
          categories[current_category].append(habit_name)
      elif unchecked:
        habit_name = unchecked.group(1)
        days[current_date][current_category][habit_name] = False
        if habit_name not in categories[current_category]:
          categories[current_category].append(habit_name)

  return {
    "categories": categories,
    "private_habits": PRIVATE_HABITS,
    "days": days,
  }


def main():
  if not HABITS_MD.exists():
    print(f"Error: {HABITS_MD} not found")
    raise SystemExit(1)

  text = HABITS_MD.read_text(encoding="utf-8")
  data = parse_habits(text)

  OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
  OUTPUT_JSON.write_text(
    json.dumps(data, indent=2, ensure_ascii=False) + "\n",
    encoding="utf-8",
  )

  day_count = len(data["days"])
  habit_count = sum(len(v) for v in data["categories"].values())
  print(f"Parsed {day_count} days, {habit_count} habits across {len(data['categories'])} categories")
  print(f"Written to {OUTPUT_JSON}")


if __name__ == "__main__":
  main()

from pathlib import Path

# TrainingArena: line 137 closes <div> from line 125, not motion.div
p = Path(r"d:\nexora\frontend\src\components\TrainingArena.tsx")
t = p.read_text(encoding="utf-8")
wrong = "          </" + "motion.div" + ">\n\n          <button"
right = "          </" + "motion.div" + ">\n\n          <button"
# fix: motion -> div for that close
wrong = "          </motion.div>\n\n          <button"
right = "          </div>\n\n          <button"
if wrong in t:
    t = t.replace(wrong, right, 1)
    p.write_text(t, encoding="utf-8")
    print("TrainingArena fixed")
else:
    print("TrainingArena: pattern not found", repr(t[3500:3600]))

# DatasetDashboard: outer wrapper is <motion.div> line 98
p2 = Path(r"d:\nexora\frontend\src\pages\DatasetDashboard.tsx")
t2 = p2.read_text(encoding="utf-8")
wrong2 = "    </motion.div>\n  );\n}\n\nfunction Stat"
right2 = "    </div>\n  );\n}\n\nfunction Stat"
if wrong2 in t2:
    t2 = t2.replace(wrong2, right2, 1)
    p2.write_text(t2, encoding="utf-8")
    print("DatasetDashboard fixed")
else:
    print("DatasetDashboard: checking...", "function Stat" in t2)

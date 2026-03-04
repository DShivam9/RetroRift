filepath = 'src/components/RetroGridBackground.css'

css = """
/* ─── 9. CUSTOM USER BACKGROUND ─── */
.bg-engine-custom {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #000;
}
.custom-bg-media {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
}
"""

with open(filepath, 'a', encoding='utf-8') as f:
    f.write(css)

print('Custom background CSS appended.')

import re

filepath = 'src/pages/ProfilePage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Import
content = content.replace("import RetroGridBackground from '../components/RetroGridBackground'", "import RetroGridBackground from '../components/RetroGridBackground'\nimport { useRetroAudio } from '../hooks/useRetroAudio'")

# 2. Add Hook to component
hook_old = r"const \[activeTab, setActiveTab\] = useState\('overview'\)"
hook_new = "const [activeTab, setActiveTab] = useState('overview')\n  const { playBlip, playTabSwitch } = useRetroAudio()"
content = re.sub(hook_old, hook_new, content)

# 3. Add SFX to Tabs
tab_old = r'<button className={`profile__tab-btn \$\{activeTab === id \? \'active\' : \'\'\}`} onClick=\{\(\) => setActiveTab\(id\)\}>'
tab_new = '<button className={`profile__tab-btn ${activeTab === id ? \'active\' : \'\'}`} onMouseEnter={playBlip} onClick={() => { playTabSwitch(); setActiveTab(id) }}>'
content = re.sub(tab_old, tab_new, content)

# 4. Add SFX to Command Center Sidebar
cat_old = r'<button key=\{cat\.id\} \n\s*className=\{`command-cat-btn \$\{customCategory === cat\.id \? \'active\' : \'\'\}`\}\n\s*onClick=\{\(\) => setCustomCategory\(cat\.id\)\}>'
cat_new = '<button key={cat.id} \n          className={`command-cat-btn ${customCategory === cat.id ? \'active\' : \'\'}`}\n          onMouseEnter={playBlip} onClick={() => { playTabSwitch(); setCustomCategory(cat.id); }}>'
content = re.sub(cat_old, cat_new, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Audio hooks injected.")

(() => {
  const languageStorageKey = 'bluetrace-language';
  const defaultLanguage = 'en';
  let currentLanguage = defaultLanguage;
  let isApplying = false;
  const portalMenus = new WeakMap();

  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  const translatableAttributes = ['aria-label', 'alt', 'placeholder', 'title'];

  const zh = {
    'BlueTrace - Immersive Ocean Journey': 'BlueTrace - 沉浸式海洋旅程',
    'About': '关于项目',
    'Science Guide': '科学解读',
    'Practice Dive': '潜水练习',
    'Field Notes': '潜水笔记',
    'Diver Passport': '潜水护照',
    'EN': '中',
    'English': '英文',
    '中文': '中文',
    'BLUETRACE': '蓝迹',
    'FOLLOW THE TRACE WE LEAVE': '循着人类留下的痕迹',
    'Enter the blue.': '潜入蔚蓝。',
    'Each breath carries you deeper into a sea that remembers.': '每一次呼吸，都把你带向一片记得痕迹的海。',
    "LET'S BEGIN": '开始',
    'The': '这片',
    'reef': '珊瑚礁',
    'is still here. Its': '仍在这里。只是它的',
    'color': '色彩',
    'is not.': '已经褪去。',
    'A': '有一只',
    'turtle': '海龟',
    'swims through what we': '正穿过',
    'left behind': '人类留下的漂浮物',
    '.': '。',
    'water': '水色',
    'clouds. The way': '浑浊起来。',
    'forward': '下潜的路',
    'fades.': '也暗下去。',
    'Scroll to advance': '继续下潜',
    'PACIFIC OCEAN': '太平洋',
    'DISCOVERY PROCESS:': '发现进度：',
    '0%': '0%',
    'DEPTH: 16M': '深度：16米',
    '|': '|',
    'TEMP: 22 °C': '水温：22 °C',
    'OFF TO LAB': '进入实验室',
    'This scene advances with a mouse wheel, trackpad, arrow keys, page keys, or touch gesture. The descent pauses at three observations before continuing.': '滚动、按键或轻触都可以推动下潜。旅程会在三处观察点停留片刻，再继续向下。',
    'Sound': '环境音',
    'No sound': '静音',
    'Sound On': '环境音开启',
    'Sound Off': '环境音关闭',
    'Reef observation': '礁区观察',
    'Trace': '追踪',
    'Lab': '实验室',
    'The water looks calm. Look closer. Compare one pollutant at a time and see how the reef responds.': '海面安静，水下却藏着线索。逐项比较污染因素，看珊瑚礁如何回应。',
    'Educational simulation. Use the tabs or arrow keys to compare factors.': '这是教育模拟。可用标签或方向键切换因素。',
    'Site: simulated reef': '地点：模拟珊瑚礁',
    'Observed 0 / 4': '已观察 0 / 4',
    'UV': '紫外线',
    'filters': '过滤剂',
    'Micro-': '微',
    'plastics': '塑料',
    'Microplastics': '微塑料',
    'PFAS': 'PFAS',
    'Endocrine': '内分泌',
    'disrupting': '干扰',
    'chemicals': '化学物质',
    'Live reef observation': '实时礁区观察',
    'Coral condition': '珊瑚状态',
    'Warning': '警示',
    'Stressed': '承压',
    'Colour is beginning to fade under changing water conditions.': '水体条件改变时，珊瑚的颜色会先慢慢退去。',
    'Healthy': '健康',
    'Degraded': '退化',
    'UV Filters': '紫外线过滤剂',
    'Endocrine-Disrupting Chemicals': '内分泌干扰化学物质',
    '20 / 100': '20 / 100',
    'Move the slider to compare lower and higher simulated exposure.': '拖动滑块，对比污染压力升高或降低时的变化。',
    'Reef response': '礁区变化',
    'At lower simulated exposure, coral colour and reef activity remain more visible.': '模拟暴露较低时，珊瑚色彩和礁区活动都更容易被看见。',
    'Log Observation': '记录这次观察',
    'Observation Logged': '已记录',
    'UV Filters observation': '紫外线过滤剂样本',
    'Explored 1 / 4': '已探索 1 / 4',
    'How Divers Influence This': '潜水行为如何改变它',
    'Pacific Ocean': '太平洋',
    'Discovery Process:': '发现进度：',
    'Depth: 16m': '深度：16米',
    'Temp: 22 °C': '水温：22 °C',
    '×': '×',
    'Field discovery': '现场线索',
    'Source': '来源',
    'Impact': '影响',
    'Responsible diving': '负责任潜水',
    'Observation complete · 4/4': '观察完成 · 4/4',
    'Pollution Notes for Responsible Divers': '负责任潜水者污染笔记',
    '01': '01',
    '02': '02',
    '03': '03',
    '04': '04',
    'How they enter:': '它们如何进入海洋：',
    'Some sunscreen ingredients wash off the skin while swimming or showering.': '一些防晒成分会在游泳或冲洗时从皮肤上脱落进入水体。',
    'Why they matter:': '为什么重要：',
    'Certain chemical UV filters may affect coral, algae and other aquatic organisms.': '某些化学紫外线过滤剂可能影响珊瑚、藻类和其他水生生物。',
    'Dive action:': '潜水行动：',
    'Wear UV-protective clothing and choose sunscreen carefully.': '穿着防紫外线衣物，并谨慎选择防晒产品。',
    'NOAA': 'NOAA',
    'Synthetic swimwear, ropes and diving equipment may shed tiny plastic fibres through wear and friction.': '合成泳衣、绳索和潜水装备可能因磨损和摩擦脱落细小塑料纤维。',
    'Microplastics persist in the ocean and can be swallowed by marine life.': '微塑料会长期存在于海洋中，并可能被海洋生物吞食。',
    'Maintain equipment, avoid disposable plastics and remove loose litter safely.': '维护装备，避免一次性塑料，并安全移除松散垃圾。',
    'UNEP': 'UNEP',
    'PFAS may wash or leach from products containing water-, oil- or stain-resistant treatments. Divers are only one possible source.': 'PFAS 可能从含防水、防油或防污处理的产品中洗脱或渗出。潜水者只是可能来源之一。',
    'These chemicals are highly persistent and can remain in water and living organisms.': '这些化学物质高度持久，可能停留在水体和生物体内。',
    'Choose PFAS-free products where clearly verified and replace equipment only when necessary.': '在明确验证的情况下选择不含 PFAS 的产品，并只在必要时更换装备。',
    'US EPA': 'US EPA',
    'Some personal-care products and equipment chemicals may wash into the sea during use.': '一些个人护理产品和装备化学物质可能在使用过程中被冲入海中。',
    'Certain substances can interfere with hormones, development or reproduction in wildlife.': '某些物质可能干扰野生动物的激素、发育或繁殖。',
    'Use fewer unnecessary products and never rinse chemical-covered equipment directly into natural water.': '减少不必要产品的使用，不要把沾有化学物质的装备直接在自然水体中冲洗。',
    'OECD': 'OECD',
    'Important:': '重要提示：',
    'These categories can overlap. Some UV filters and PFAS may also have endocrine-disrupting effects; they are not always four completely separate pollutant groups.': '这些类别可能相互重叠。一些紫外线过滤剂和 PFAS 也可能具有内分泌干扰效应；它们并不总是四组完全分离的污染物。',
    'Begin Dive': '开始下潜',
    'DEPTH: 18M': '深度：18米',
    'TEMP: 21 °C': '水温：21 °C',
    'Trace lightly. Dive responsibly.': '下潜轻一点，把影响留到最低。',
    'What you have learned now follows you into the water.': '刚刚读懂的线索，会跟着你进入水下。',
    'The ocean remembers every action we take.': '你的每个动作，海都会记得。',
    'Navigate your simulated dive.': '进入这次模拟潜水。',
    'ENTER': '进入',
    "The Anchor's Dilemma": '该把锚落在哪里',
    'DIVE IN': '下潜',
    'A Bag on the Seabed': '海床上的袋子',
    'Fragments of the Reef': '散落的珊瑚碎片',
    'Meeting the Sea Turtle': '与海龟相遇',
    'The reef provides stable ground to secure your vessel.': '珊瑚礁看似稳固，船锚似乎能抓得很牢。',
    'Drop the anchor above the reef area.': '直接在礁区下锚。',
    'Steer toward open sand to set anchor.': '转向开阔沙地再落锚。',
    'Anchors and anchor chains will scrape, crack and destroy live coral.': '锚和锚链会拖拽、刮裂，甚至压碎活珊瑚。',
    'Even though coral holds the boat firmly, anchoring on reefs causes irreversible damage to coral ecosystems.': '珊瑚也许能让船停住，但在礁区下锚会给生态系统留下难以恢复的伤口。',
    'MOVE ON TO PASSPORT': '去查看护照',
    'Sandy seabeds are the proper anchoring zone.': '开阔沙地才适合落锚。',
    'You can safely fix your vessel without harming coral communities.': '船可以停稳，珊瑚也能保持完整。',
    'Always avoid dropping anchors directly onto reef habitats.': '不要把锚落在珊瑚礁这样的生命栖息地上。',
    'RETURN': '返回',
    'Floating plastic poses known risks to reef life.': '漂浮塑料确实会威胁礁区生命。',
    'Retrieve the plastic bag from the seabed.': '立刻把袋子捡起来。',
    'Continue observing before taking action.': '先观察，再决定怎么处理。',
    'It seems intuitive to clear plastic waste.': '看到塑料，第一反应往往是清走它。',
    'However, sudden grabbing may frighten or injure small marine creatures hiding inside the bag.': '但如果有小生物躲在里面，突然伸手可能会惊扰甚至伤到它们。',
    'Hasty action can bring unintended harm.': '好意太急，也可能变成打扰。',
    'Slow observation helps you check whether any aquatic organisms are trapped inside.': '先慢下来观察，才能判断里面是否困着生物。',
    'Responsible cleanup means protecting wildlife while removing marine litter.': '真正负责任的清理，是把垃圾带走，也把生命保护好。',
    'Fragments of reef material are common across sandy bottoms.': '沙地上常会散落一些珊瑚碎片。',
    'Take the coral fragment to keep as a dive souvenir.': '把这块珊瑚带走，留作纪念。',
    'Let the coral fragment remain on the seabed.': '让它继续留在海床上。',
    'Broken coral rubble is vital habitat for tiny marine life.': '破碎珊瑚也可能是微小生命的住处。',
    'These fragments also aid natural coral recovery.': '有些碎片还会参与珊瑚的自然恢复。',
    'Removing rubble disrupts the reef’s self-repair process.': '把它带走，可能打断珊瑚礁缓慢的自我修复。',
    'Leave all coral materials underwater.': '让珊瑚材料留在水下。',
    'Even broken coral pieces serve important ecological functions.': '即使已经破碎，它们仍在生态系统里发挥作用。',
    'The principle “take nothing but photos” applies to all reef fragments.': '“除了照片什么都不带走”，也适用于每一块珊瑚碎片。',
    'The turtle moves slowly through clear water.': '海龟正缓慢游过清澈的水。',
    'Swim forward to follow the turtle and capture detailed photographs.': '游近一些，跟上它，拍下更清楚的照片。',
    'Adjust your path and travel alongside at a distance.': '调整路线，保持距离，平行陪它游一段。',
    'Chasing and closely following marine turtles creates continuous stress.': '追逐或贴近海龟，会让压力持续累积。',
    'Disturbance may alter their feeding, resting and migration behaviour.': '这种干扰可能改变它们觅食、休息和迁徙的节奏。',
    'Maintaining a respectful buffer zone protects wild animals.': '保持距离，就是给野生动物留下选择空间。',
    'You can observe and photograph sea creatures without interfering with their natural activities.': '好的观察，不需要打断它们原本的生活。',
    'DEPTH': '深度',
    '16 M': '16 米',
    'STATUS': '状态',
    'RECORDING': '记录中',
    'ACT IV · DIVE RECORD': '第四幕 · 潜水记录',
    'What you carry': '你带回的',
    'to the surface.': '水下选择。',
    'A record of the choices you practised below. Not a diving qualification—an intention for the next time you enter the water.': '这份记录写下你刚才在水下做出的选择。它不是资格证明，而是下一次入水前的一次提醒。',
    'OPEN PASSPORT': '查看护照',
    '↓': '↓',
    'BLUETRACE / FIELD EDITION': '蓝迹 / 潜水记录版',
    'NO. 04—2417': '编号 04—2417',
    'RESPONSIBLE DIVER': '负责任的潜水者',
    'PASSPORT': '护照',
    'BT': 'BT',
    'FIELD': '潜水',
    'RECORD': '记录',
    'DEPTH REACHED': '最深下潜',
    '16': '16',
    'METRES': '米',
    'SAMPLES OBSERVED': '观察样本',
    '--': '--',
    'OF 04': '共 04',
    'SKILLS PRACTISED': '练习技能',
    'DIVE DATE': '记录日期',
    '--- ----': '--- ----',
    'ACHIEVEMENTS RECORDED': '本次获得',
    'WATER READER': '水样读者',
    'Sample observed': '读懂水样',
    'HIDDEN EVIDENCE': '隐藏证据',
    'Pollution identified': '看见隐藏污染',
    'SAND STEWARD': '沙地守护者',
    'Anchor set clear of reef': '避开礁区下锚',
    'PATIENT OBSERVER': '耐心观察者',
    'Debris assessed with care': '先判断再清理',
    'SEABED KEEPER': '海床守护者',
    'Coral fragment left in place': '让珊瑚留在海里',
    "TURTLE'S PACE": '海龟的节奏',
    'Travelled alongside with space': '留出距离同行',
    'Journey complete': '完成这次下潜',
    'PERSONAL OCEAN PLEDGE': '给下一次下潜的承诺',
    'Your personal ocean pledge': '你的个人海洋承诺',
    'On my next dive, I will...': '下一次潜水时，我会……',
    '0': '0',
    '/ 180 · saved on this device': '/ 180 · 保存在本设备',
    'FIELD NOTE /': '潜水笔记 /',
    'DIVE INSTRUCTOR': '潜水教练',
    'MARINE BIOLOGIST': '海洋生物学家',
    'CONSERVATION DIVER': '保育潜水员',
    'PUBLISHED GUIDANCE': '公开指南',
    '"Pause before you approach. A calm animal is not an invitation to get closer."': '“靠近之前先停一停。动物看起来平静，并不代表它邀请你更靠近。”',
    '“Pause before you approach. A calm animal is not an invitation to get closer.”': '“靠近之前先停一停。动物看起来平静，并不代表它邀请你更靠近。”',
    '“Distance lets an animal choose its own route. That choice is part of a healthy reef.”': '“距离让动物可以选择自己的路线。这种选择，是健康珊瑚礁的一部分。”',
    '“Good buoyancy is quiet. When the seabed stays still, more of the reef can keep doing its work.”': '“好的浮力是安静的。海床保持稳定时，珊瑚礁才能继续完成更多自己的工作。”',
    '“If you cannot identify an object safely, leave it where it is and seek local guidance.”': '“如果你无法安全识别某个物体，就让它留在原处，并寻求当地指导。”',
    '↻': '↻',
    'EDUCATIONAL SIMULATION · THIS PASSPORT DOES NOT CERTIFY DIVING COMPETENCE': '教育模拟 · 这不是潜水能力认证',
    'CLOSE': '关闭',
    'ACHIEVEMENT LOG': '徽章说明',
    'HOW IT WAS EARNED': '你为什么获得它',
    'RECORD SECURED': '记录已生成',
    'Your dive record': '这份潜水记录',
    'is ready to keep.': '可以带走了。',
    'Your learning record has been prepared on this device. It records your ocean pledge and the practices you explored in this journey.': '这份学习记录已生成在本设备上，记录了你的海洋承诺，以及这段旅程里的潜水练习。',
    'DIVING PRACTICES': '潜水练习',
    '04 RECORDED': '记录 04 项',
    'EDUCATIONAL RECORD': '学习记录',
    'DOWNLOAD RECORD': '下载护照',
    'BACK TO PASSPORT': '返回护照',
    'SAVE YOUR RECORD': '保存这次下潜',
    '↗': '↗',
    'Keep the evidence. Bring the practice with you.': '记住这些线索，也把练习带走。',
    'THE NEXT DIVE HAPPENS IN THE REAL OCEAN.': '下一次下潜，就在真实的海里。',
    'Take only memories.': '只带走记忆。',
    'Leave only bubbles.': '只留下气泡。',
    'Ocean Science Guide': '海洋科学解读',
    'Read the ocean through the signals that shape reef health, from water chemistry to invisible pollutants.': '从水体信号到隐形污染，读懂珊瑚礁健康背后的变化。',
    'Ocean Health Indicators': '海洋健康信号',
    'Potential Temperature': '位势温度',
    "Potential temperature reflects the ocean's heat content and helps track warming caused by excess human-made heat.": '位势温度能反映海洋储存了多少热量，也帮助追踪人类活动带来的增温。',
    'Key signal: ocean heat storage': '关键信号：海洋储热',
    'Water Velocity': '水流速度',
    'Current speed controls how heat, salt, nutrients and pollutants move after they enter the sea.': '洋流速度会影响热量、盐分、营养物和污染物在海中的去向。',
    'Use: track pollutant pathways': '用途：判断污染去向',
    'Seawater pH': '海水 pH',
    'pH shows ocean acidity. More CO2 forms carbonic acid, weakening coral skeletons and shell formation.': 'pH 能显示海水酸化程度。CO2 增多会形成碳酸，让珊瑚骨骼和贝壳更难形成。',
    'Normal range: pH 7.5-8.2': '正常范围：pH 7.5-8.2',
    'Dissolved Oxygen': '溶解氧',
    'Fish and benthic life depend on dissolved oxygen. Low levels create hypoxia stress, often after algal blooms.': '鱼类和底栖生物依赖溶解氧。低氧会造成缺氧压力，常发生在藻华之后。',
    'Healthy coastal water: 6-8 mg/L': '健康近岸水体：6-8 mg/L',
    'Phosphate': '磷酸盐',
    'Phosphate feeds phytoplankton, but excess runoff and wastewater can trigger eutrophication and algal blooms.': '磷酸盐能供给浮游植物，但过量径流和废水会引发富营养化和藻华。',
    'Typical seawater: below 0.1 mmol/m3': '典型海水：低于 0.1 mmol/m3',
    'Chlorophyll-a': '叶绿素 a',
    'Chlorophyll-a indicates phytoplankton biomass, ocean productivity and possible eutrophication when unusually high.': '叶绿素 a 指示浮游植物生物量、海洋生产力；异常偏高时可能意味着富营养化。',
    'Signal: phytoplankton biomass': '信号：浮游植物生物量',
    'Live Indicator Map': '实时指标地图',
    'Open the Copernicus Marine map to compare real-time ocean health indicator layers.': '打开 Copernicus Marine 地图，对比实时海洋健康指标图层。',
    'Open the Copernicus Marine live ocean health indicators map in a new tab': '在新标签页打开 Copernicus Marine 实时海洋健康指标地图',
    'Open Live Map': '打开实时地图',
    'Six Emerging Pollutants': '六类正在浮现的污染',
    'Forever chemicals': '难以消失的化学物',
    "Your dive suit's coating can outlast you in the sea.": '潜水服上的涂层，可能在海里停留很久。',
    'Half-life >41 years': '半衰期 >41 年',
    'Learn More': '了解更多',
    'Invisible plastic dust': '看不见的塑料碎屑',
    'From your fins to Antarctic ice, tiny fragments keep moving.': '从脚蹼磨损到南极海冰，细小碎片会一路迁移。',
    '170 trillion particles': '170 万亿个颗粒',
    'EDCs': '内分泌干扰物',
    'Hormone hijackers': '扰乱激素的化学物',
    'Fish can change sex, and coral larvae may fail to settle.': '鱼类可能改变性别，珊瑚幼体可能无法附着。',
    'High risk at 65% of sites': '65% 采样点存在高风险',
    'High risk at 65% of global sites': '全球 65% 采样点存在高风险',
    "Sunscreen's hidden toll": '防晒背后的代价',
    'What you apply, the reef absorbs.': '你涂在皮肤上的，可能最终进入礁区。',
    '25-40% washes off in 20 minutes': '20 分钟内会冲掉 25-40%',
    'Antibiotics': '抗生素',
    'Invisible residue': '水中的隐形残留',
    'Aquaculture residues can fuel superbugs.': '水产养殖残留可能推动耐药风险。',
    'Seawater: 0.12-309.71 ng/L': '海水：0.12-309.71 ng/L',
    'Micro-nanoplastics': '微纳塑料',
    'Cell-scale plastic': '细胞尺度的塑料',
    'Small enough to cross cell membranes, from seawater to your blood.': '小到可能穿过细胞边界，从海水进入生命体。',
    'Detected in Antarctic sea ice': '已在南极海冰中检出',
    'What Are They?': '这些污染从哪里来？',
    'Unlike traditional pollutants such as oil spills or heavy metals, emerging pollutants are difficult to see and harder to trace. Their risk comes from low-dose, long-term exposure.': '它们不像石油泄漏或重金属那样显眼，往往看不见，也更难追踪。真正的风险，来自低剂量、长时间的累积暴露。',
    'Invisible presence:': '看不见，却存在：',
    'Extremely low concentrations, from ng/L to ug/L, can still create significant effects.': '即使浓度低到 ng/L 或 ug/L，也可能带来影响。',
    'Persistent residues:': '留下很久的残留：',
    'Some, like PFAS, barely degrade and are known as forever chemicals.': '有些物质，例如 PFAS，几乎不会自然降解。',
    'Mixture effects:': '混在一起的风险：',
    'Multiple pollutants can combine into toxicity that is greater than a single substance.': '多种污染物叠加后，影响可能超过任何一种单独物质。',
    'Diver pathways:': '潜水者也可能带入：',
    'Dive gear, sunscreen and personal care products can carry pollutants directly into the ocean.': '装备、防晒和个人护理产品，都可能把污染物直接带进海里。',
    'How Widespread?': '它们已经到达哪里？',
    'PFAS have been detected in marine life from coastal fish to polar seals.': '从近岸鱼类到极地海豹，海洋生物体内都检出了 PFAS。',
    'Microplastics have reached remote environments, including Antarctic sea ice and the Mariana Trench.': '微塑料已经到达偏远环境，包括南极海冰和马里亚纳海沟。',
    'EDCs pose high risks at 65% of global sampling sites.': '全球 65% 的采样点显示内分泌干扰物具有高风险。',
    'UV filters show elevated concentrations in tourist areas linked to diving and swimming.': '在与潜水和游泳相关的旅游区域，紫外线过滤剂浓度更高。',
    "China's Bohai, Yellow, East China and South China Seas show multiple emerging pollutants, with higher levels near intensive economic activity and dense populations.": '中国渤海、黄海、东海和南海均显示多种新兴污染物；在经济活动密集和人口密集区域附近水平更高。',
    'Why Your Actions Matter': '为什么你的选择有意义',
    '25-40% of chemical sunscreen can wash off within 20 minutes of entering the water.': '入水 20 分钟内，25-40% 的化学防晒成分可能被冲掉。',
    'PFAS coatings on dive gear can release chemicals as equipment is used and ages.': '潜水装备上的 PFAS 涂层会随着使用和老化释放化学物质。',
    'Personal care products containing EDCs can reach the ocean through shower wastewater.': '含内分泌干扰物的个人护理产品可能通过淋浴废水进入海洋。',
    'Gear wear and tear can shed microplastics directly into the water.': '装备磨损会把微塑料直接释放进水中。',
    'References': '参考资料',
    'UNEP (2023). Marine Litter and Plastic Pollution Report.': 'UNEP（2023）。海洋垃圾与塑料污染报告。',
    'WHO (2025). Global PFAS Exposure Assessment Report.': 'WHO（2025）。全球 PFAS 暴露评估报告。',
    'NOAA (2026). Global Ocean Microplastics Database.': 'NOAA（2026）。全球海洋微塑料数据库。',
    'Ministry of Ecology and Environment, China (2025). China Marine Ecological Environment Status Bulletin.': '中国生态环境部（2025）。中国海洋生态环境状况公报。',
    'Dalian University of Technology (2026). MarineTox Predictor - Marine Ecotoxicity Database.': '大连理工大学（2026）。MarineTox Predictor - 海洋生态毒性数据库。',
    'Pollutant File 01': '污染物档案 01',
    "Forever chemicals - your dive suit's coating outlasts you in the sea.": '永久化学物质 - 你的潜水服涂层在海中存在得更久。',
    'PFAS barely degrade, leaving persistent residues in marine environments.': 'PFAS 几乎不降解，会在海洋环境中留下持久残留。',
    'Detected in marine life from coastal fish to polar seals.': '从近岸鱼类到极地海豹，海洋生物中均有检出。',
    'Dive gear coatings can release chemicals through use and aging.': '潜水装备涂层会因使用和老化释放化学物质。',
    'Choose durable gear carefully, maintain it longer, and avoid unnecessary coated replacements.': '谨慎选择耐用装备，延长维护使用时间，避免不必要的涂层装备替换。',
    'Return': '返回',
    'Pollutant File 02': '污染物档案 02',
    'Invisible plastic dust - from your fins to Antarctic ice.': '看不见的塑料尘埃 - 从你的脚蹼到南极海冰。',
    'Microplastics can travel through currents and settle far from where they were released.': '微塑料会随洋流移动，并沉降在远离释放源的地方。',
    'Detected in remote environments including Antarctic sea ice and the Mariana Trench.': '已在南极海冰和马里亚纳海沟等偏远环境中检出。',
    'Gear wear and tear can shed small fragments directly into the water.': '装备磨损会把细小碎片直接释放到水中。',
    'Rinse, repair and retire gear responsibly before it begins shedding heavily.': '在装备大量脱落碎片前，负责任地冲洗、修理和退役装备。',
    'Pollutant File 03': '污染物档案 03',
    'Hormone hijackers - fish change sex, coral larvae cannot settle.': '激素劫持者 - 鱼类改变性别，珊瑚幼体无法附着。',
    'Endocrine-disrupting chemicals can interfere with biological signaling even at low concentrations.': '即使浓度很低，内分泌干扰化学物质也可能干扰生物信号。',
    'Personal care products can enter the ocean through shower wastewater.': '个人护理产品可能通过淋浴废水进入海洋。',
    'Reduce unnecessary products before coastal activity and rinse responsibly away from direct marine discharge.': '海岸活动前减少不必要产品，并在远离直接入海排放的地方负责任地冲洗。',
    'Pollutant File 04': '污染物档案 04',
    "Sunscreen's hidden toll - what you apply, the reef absorbs.": '防晒品的隐藏代价 - 你涂在身上的，会被珊瑚礁吸收。',
    'Chemical sunscreen can wash off quickly after entering the water.': '化学防晒成分入水后可能很快被冲掉。',
    'Reefs receive that residue directly during coastal recreation.': '在海岸休闲活动中，珊瑚礁会直接接收这些残留。',
    'Use physical protection first, apply products carefully, and avoid entering water immediately after application.': '优先使用物理防护，谨慎涂抹产品，并避免涂抹后立即入水。',
    'Pollutant File 05': '污染物档案 05',
    "Aquaculture's invisible residue - fueling superbugs.": '水产养殖的隐形残留 - 助长超级细菌。',
    '0.12-309.71 ng/L in seawater': '海水中 0.12-309.71 ng/L',
    'Antibiotic residues can remain in coastal waters and contribute to resistance pressure.': '抗生素残留可能停留在近岸水体中，并增加耐药性压力。',
    'Some seawater samples show detectable antibiotic concentrations.': '一些海水样本显示可检出的抗生素浓度。',
    'Residues are often invisible during a dive, even when present.': '即使存在，残留在潜水时也常常看不见。',
    'Responsible seafood choices and coastal wastewater awareness help reduce upstream pressure.': '负责任的海产品选择和对近岸废水的关注，有助于减少上游压力。',
    'Pollutant File 06': '污染物档案 06',
    'Small enough to cross cell membranes - from seawater to your blood.': '小到可以穿过细胞膜 - 从海水进入血液。',
    'Micro-nanoplastics are small enough to move through biological boundaries and remote ocean systems.': '微纳塑料足够小，能够穿过生物边界并进入偏远海洋系统。',
    'They have been detected in Antarctic sea ice.': '它们已在南极海冰中检出。',
    'Their scale makes them difficult to see, filter and remove.': '它们的尺度使其难以看见、过滤和移除。',
    'Reduce disposable plastics near water and keep aging synthetic gear from shedding into the sea.': '在水边减少一次性塑料，并避免老化合成装备向海中脱落碎片。',
    'Notes from a lighter dive.': '一次更轻扰的下潜笔记。',
    'Complete each practice task to add its responsible diving note to your log.': '完成练习任务，对应的潜水提醒就会写进你的记录。',
    'Locked': '已锁定',
    'Unlocked': '已解锁',
    'Anchor on Sand, Never on Reef': '锚落沙地，不落礁区',
    "Complete The Anchor's Dilemma to unlock this note.": '完成“该把锚落在哪里”后解锁。',
    'Choose open sand or a mooring buoy. Anchors and chains can break living coral and damage habitats that may take years to recover.': '选择开阔沙地或系泊浮标。锚和锚链会折断活珊瑚，也可能破坏多年才能恢复的栖息地。',
    'Observe Before You Remove': '动手之前，先看清楚',
    'Complete A Bag on the Seabed to unlock this note.': '完成“海床上的袋子”后解锁。',
    'Check marine debris before touching it. An animal may be trapped inside or using it as shelter, so immediate removal can cause further harm.': '触碰海洋废弃物前先确认情况。里面可能困着动物，也可能已经成为临时庇护所，贸然移走反而会伤害生命。',
    'Leave Coral in the Ocean': '让珊瑚留在海里',
    'Complete Fragments of the Reef to unlock this note.': '完成“散落的珊瑚碎片”后解锁。',
    'Never collect coral, even if it appears broken or loose. Coral fragments remain part of the ecosystem and may provide shelter for marine life.': '不要收集珊瑚，即使它看起来已经破碎或松动。碎片仍属于生态系统，也可能正为海洋生命提供庇护。',
    'Give Wildlife Space': '给野生动物留空间',
    'Complete Meeting the Sea Turtle to unlock this note.': '完成“与海龟相遇”后解锁。',
    'Watch animals from a safe distance and never follow or surround them. Approaching too closely can cause stress and interrupt their natural behavior.': '保持距离观察，不要追逐或包围。靠得太近会造成压力，也会打断它们原本的行为。',
    'About BlueTrace': '关于 BlueTrace',
    'Every dive leaves a trace.': '每一次下潜，都会留下痕迹。',
    'The question is what kind of trace we choose to leave behind.': '关键在于，我们想留下怎样的痕迹。',
    'Our Story': '我们的故事',
    "The idea behind BlueTrace began beneath the ocean's surface.": 'BlueTrace 的起点，在海面之下。',
    'During our diving experiences, we witnessed plastic waste drifting through the water and coral reefs showing signs of stress and degradation. We realized that while many divers deeply care about the ocean, few understand how everyday choices, from sunscreen use to equipment habits, can leave invisible traces on marine ecosystems.': '潜水时，我们看见塑料垃圾漂过水体，也看见珊瑚礁露出承压和退化的迹象。很多潜水者真心在意海洋，却未必知道，防晒品、装备使用这些日常选择，也会在生态系统里留下看不见的痕迹。',
    'This experience inspired us to create BlueTrace, a platform that transforms underwater observations and scientific knowledge into an interactive learning journey.': '于是我们做了 BlueTrace，希望把水下观察和科学知识，变成一段可以亲自参与的学习旅程。',
    'Who We Are': '我们是谁',
    'BlueTrace is a student-led ocean awareness project developed by a team of high school researchers, designers and divers united by a passion to understand and protect marine ecosystems.': 'BlueTrace 是一个由学生主导的海洋认知项目。团队成员是高中阶段的研究者、设计者和潜水者，我们因为想理解并保护海洋生态而聚在一起。',
    'Our Mission': '我们的使命',
    'To empower divers with scientific and practical knowledge for more responsible ocean exploration.': '让潜水者带着科学理解和实际方法，更负责地探索海洋。',
    'Through interactive experiences, we aim to help ocean lovers understand their impact and make choices that better protect the ecosystems they admire.': '我们希望通过互动体验，让热爱海洋的人看见自己的影响，并做出更保护生态的选择。',
    'Every dive leaves a trace. The question is what kind of trace we choose to leave behind.': '每一次下潜，都会留下痕迹。关键在于，我们想留下怎样的痕迹。',
    'Our Approach': '我们的方法',
    'Built within 24 hours using Vibe Coding, BlueTrace combines diver observations, environmental research, AI-assisted development, and interactive design to transform marine science into an immersive experience.': 'BlueTrace 在 24 小时内通过 Vibe Coding 搭建而成，融合潜水观察、环境研究、AI 辅助开发和互动设计，把海洋科学变成一段沉浸体验。',
    'By connecting human choices with visible changes in coral ecosystems, we turn complex environmental issues into a story that divers can see, understand, and act upon.': '我们把人的选择和珊瑚生态的可见变化连接起来，让复杂议题变成潜水者能看见、能理解、也能行动的故事。',
    'Our Vision': '我们的愿景',
    'We envision a future where responsible diving becomes part of ocean exploration, where every diver is not only an observer, but also a protector of the marine environments they love.': '我们期待有一天，负责任潜水成为海洋探索的自然习惯。每一位潜水者不只是观察者，也能成为所爱海域的守护者。',

    'Witness: scroll-controlled ocean descent': '第一幕：滚动下潜观察',
    'BlueTrace': 'BlueTrace',
    'Primary navigation': '主导航',
    'Open language menu': '打开语言菜单',
    'Language options': '语言选项',
    'BlueTrace introduction': 'BlueTrace 介绍',
    'Trace Lab': '追踪实验室',
    'Enable sound': '开启环境音',
    'Mute sound': '关闭环境音',
    'BlueTrace Trace Lab': 'BlueTrace 追踪实验室',
    'Reef exposure observation console': '礁区污染观察台',
    'Reef pollutant factors': '影响礁区的污染因素',
    'A healthy, colourful coral reef used to illustrate the simulated condition.': '一片用于展示模拟状态的健康彩色珊瑚礁。',
    'Sunscreen residue dispersing above a stressed coral reef.': '防晒残留在承压珊瑚礁上方扩散的画面。',
    'Dive location and conditions': '潜水地点与条件',
    'Close pollutant reveal': '关闭污染物揭示',
    'Close pollution notes': '关闭污染笔记',
    'Continue to the simulated dive': '继续进入潜水练习',
    'Practice Dive and Diver Passport': '潜水练习与潜水护照',
    'Practice dive tasks': '潜水练习任务',
    'Dive record status': '潜水记录状态',
    'BlueTrace diver passport': 'BlueTrace 潜水护照',
    'BlueTrace field record seal': 'BlueTrace 潜水记录印章',
    'Dive record': '潜水记录',
    'Learn about the Water Reader achievement': '了解“水样读者”成就',
    'Learn about the Hidden Evidence achievement': '了解“隐藏证据”成就',
    'Learn about the Sand Steward achievement': '了解“沙地守护者”成就',
    'Learn about the Patient Observer achievement': '了解“耐心观察者”成就',
    'Learn about the Seabed Keeper achievement': '了解“海床守护者”成就',
    "Learn about the Turtle's Pace achievement": '了解“海龟的节奏”成就',
    'Learn about the Responsible Diver achievement': '了解“负责任潜水者”成就',
    'Show another field note': '换一条潜水笔记',
    'Close achievement details': '关闭成就详情',
    'Return to passport': '返回护照',
    'Science Guide navigation': '科学解读导航',
    'Return to Practice Dive': '返回潜水练习',
    'Field Notes navigation': '潜水笔记导航',
    'Responsible diving notes': '负责任潜水提醒',
    'About page navigation': '关于页面导航',

    'Reef vitality': '珊瑚礁活力',
    'This educational simulation shows a gradual, pollutant-specific reef response.': '这个模拟用来展示不同污染压力下，礁区可能出现的渐进变化。',
    'This is an educational exposure index, not a measurement of one product or one swim.': '这里显示的是教育用暴露指数，不代表某个产品或某次入水的真实测量。',
    'This is an educational exposure index; plastic pathways and impacts vary by place and material.': '这里显示的是教育用暴露指数；塑料的路径和影响会随地点、材料而变化。',
    'This is an educational exposure index. PFAS are mostly invisible and require laboratory analysis to identify.': '这是一个教育用途的暴露指数。PFAS 大多不可见，需要实验室分析才能识别。',
    'This is an educational exposure index. Effects vary by chemical, concentration, species, and life stage.': '这是一个教育用途的暴露指数。影响会因化学物质、浓度、物种和生命阶段而异。',
    'Higher simulated UV-filter exposure gradually reduces coral colour and vitality.': '模拟暴露升高时，珊瑚颜色和活力会逐渐下降。',
    'At lower simulated exposure, the water column stays clearer and fish remain easier to see.': '在较低模拟暴露下，水体更清澈，鱼类更容易看见。',
    'Higher simulated microplastic exposure adds visible fragments, haze, and reduces fish visibility.': '较高的模拟微塑料暴露会增加可见碎片和浑浊度，并降低鱼类可见度。',
    'At lower simulated exposure, no obvious visual signal is shown because PFAS pollution is often invisible.': '在较低模拟暴露下，没有明显视觉信号，因为 PFAS 污染通常不可见。',
    'Higher simulated PFAS exposure shows subtle coral stress and a restrained scientific warning, not visible litter.': '较高的模拟 PFAS 暴露会呈现细微珊瑚压力和克制的科学警示，而不是可见垃圾。',
    'At lower simulated exposure, fish activity and reef biodiversity remain more visible.': '在较低模拟暴露下，鱼类活动和珊瑚礁生物多样性更清晰可见。',
    'Higher simulated exposure represents hormonal stress that may affect growth, development, or reproduction in aquatic wildlife.': '较高模拟暴露代表可能影响水生野生动物生长、发育或繁殖的激素压力。',
    'Watch coral colour fade as simulated UV-filter exposure rises.': '观察模拟紫外线过滤剂暴露升高时，珊瑚色彩如何褪去。',
    'Watch the water cloud as simulated fragments become more common.': '观察模拟碎片增多时，海水如何变浑浊。',
    "PFAS pressure is mostly invisible. Look for the reef’s gradual change.": 'PFAS 压力大多不可见。留意珊瑚礁的渐进变化。',
    'Watch reef activity decline as simulated endocrine disrupting chemical exposure rises.': '观察模拟内分泌干扰化学物质暴露升高时，珊瑚礁活动如何下降。',
    'Sunscreen and skincare residues entering seawater.': '进入海水的防晒与护肤残留。',
    'Tiny plastic fragments and synthetic fibres in seawater.': '海水中的微小塑料碎片和合成纤维。',
    'Persistent chemicals sometimes used in water-resistant materials.': '有时用于防水材料的持久性化学物质。',
    'Chemicals that can mimic, block, or alter hormone signals in aquatic animals.': '能够模拟、阻断或改变水生动物激素信号的化学物质。',
    'UV filters help sunscreen absorb ultraviolet light. Laboratory and field research has linked some filters with coral stress. Reducing unnecessary exposure is a practical precaution.': '紫外线过滤剂帮助防晒品吸收紫外线。实验室和野外研究已将部分过滤剂与珊瑚压力联系起来。减少不必要暴露是一种实际的预防措施。',
    'Chemical UV filters – including oxybenzone (BP-3), octinoxate (EHMC), homosalate, and avobenzone – are common ingredients in dive-specific sunscreens and everyday sunscreens used by divers.': '化学紫外线过滤剂，包括羟苯甲酮（BP-3）、甲氧基肉桂酸乙基己酯（EHMC）、胡莫柳酯和阿伏苯宗，是潜水专用防晒品和潜水者日常防晒品中的常见成分。',
    'Oxybenzone, a common UV filter, causes coral bleaching and damage to coral larvae at concentrations as low as 62 parts per trillion. Many UV filters are also EDCs — they disrupt fish reproduction and hormone function. These chemicals have been found in fish, mussels, dolphins, and even human breast milk.': '羟苯甲酮是一种常见紫外线过滤剂，即使浓度低至万亿分之 62，也可能造成珊瑚白化并伤害珊瑚幼体。许多紫外线过滤剂也是内分泌干扰物，会扰乱鱼类繁殖和激素功能。这些化学物质已在鱼类、贻贝、海豚，甚至人类母乳中发现。',
    'Switch to mineral-based sunscreens (zinc oxide or titanium dioxide, non-nano).': '改用矿物基防晒品（氧化锌或二氧化钛，非纳米）。',
    'Apply sunscreen at least 15 minutes before entering the water to allow absorption.': '至少在入水前 15 分钟涂抹防晒，让其吸收。',
    'Consider wearing a rash guard or wetsuit with UPF protection to reduce sunscreen use.': '考虑穿着具 UPF 防护的防晒衣或潜水服，减少防晒品使用。',
    'Share this knowledge with fellow divers — collective action makes a real difference.': '把这些知识分享给同行潜水者，集体行动会带来真正改变。',
    'Microplastics are small pieces of plastic, including fragments and synthetic fibres. Animals can ingest them, and the particles can carry other pollutants through food webs.': '微塑料是细小塑料颗粒，包括碎片和合成纤维。动物可能摄入它们，这些颗粒也会携带其他污染物穿过食物网。',
    'Scuba fins, masks, snorkels, and neoprene suits shed microplastics through abrasion and wear. Single-use plastic items (e.g., water bottles, packaging) can also end up in the sea.': '水肺脚蹼、面镜、呼吸管和氯丁橡胶潜水服会因摩擦和磨损释放微塑料。一次性塑料物品（如水瓶、包装）也可能最终进入海洋。',
    'Microplastics are consumed by marine organisms at the base of the food chain, affecting their growth and reproduction. They also adsorb heavy metals and other toxins, acting as carriers that introduce pollutants into marine life. In some areas, microplastic concentrations biomagnify — they become more concentrated at higher levels of the food web.': '食物链底层的海洋生物会摄入微塑料，影响其生长和繁殖。微塑料还会吸附重金属和其他毒素，成为把污染物带入海洋生命体内的载体。在一些区域，微塑料浓度会生物放大，在食物网较高层级中变得更集中。',
    'Invest in durable, long-lasting gear.': '选择耐用、寿命更长的装备。',
    'Avoid single-use plastics during dives — bring a reusable water bottle.': '潜水期间避免一次性塑料，携带可重复使用的水瓶。',
    'Join or organize underwater clean-up activities.': '加入或组织水下清理活动。',
    'Choose seafood from farms that use sustainable practices and eco-friendly equipment.': '选择采用可持续做法和环保装备的养殖场所生产的海产品。',
    'A plastic bag resembling a jellyfish amid dispersed microplastic fragments underwater.': '一个像水母的塑料袋漂在水下分散的微塑料碎片之间。',
    'PFAS are a large group of persistent chemicals. Some are used in water-resistant materials and coatings, and certain PFAS can build up in organisms over time.': 'PFAS 是一大类持久性化学物质。其中一些用于防水材料和涂层，某些 PFAS 会随时间在生物体内累积。',
    'PFAS are widely used in waterproof coatings for dive suits, BCDs (buoyancy compensators), and dry bags, which gradually leach into the water with use and aging.': 'PFAS 广泛用于潜水服、BCD（浮力调节装置）和防水袋的防水涂层中，并会随着使用和老化逐渐渗入水体。',
    'PFAS accumulate in marine food chains. Concentrations increase as they move from smaller organisms to larger predators. They have been detected in fish, marine mammals, and coral tissues. Some PFAS are linked to liver damage, reproductive issues, and immune system disruption.': 'PFAS 会在海洋食物链中累积。从小型生物到大型捕食者，浓度会逐级升高。它们已在鱼类、海洋哺乳动物和珊瑚组织中检出。一些 PFAS 与肝损伤、生殖问题和免疫系统干扰有关。',
    'Choose gear labeled "PFAS-free" or "PFC-free."': '选择标注“PFAS-free”或“PFC-free”的装备。',
    'Maintain your equipment to extend its lifespan — less frequent replacement means less environmental input.': '维护装备以延长寿命；更少更换意味着更少环境输入。',
    'Ask your local dive shop about the chemical treatments used in their products.': '向当地潜店询问其产品使用了哪些化学处理。',
    'A diver gliding above a coral reef in clear water, illustrating an otherwise invisible chemical stressor.': '一名潜水者在清澈水中滑过珊瑚礁，用来说明原本不可见的化学压力源。',
    'Endocrine disrupting chemicals interfere with hormone signals that control growth, development, and reproduction. Some pharmaceuticals, pesticides, and ingredients in consumer products can act this way. In water, effects depend on the chemical, concentration, species, and life stage.': '内分泌干扰化学物质会干扰控制生长、发育和繁殖的激素信号。一些药物、农药和消费品成分可能具有这种作用。在水体中，影响取决于化学物质、浓度、物种和生命阶段。',
    'Many sunscreens, personal care products, and anti-fog treatments for dive masks contain EDCs such as parabens, phthalates, and oxybenzone. These wash off directly into the water during dives.': '许多防晒品、个人护理产品和潜水面镜防雾剂含有对羟基苯甲酸酯、邻苯二甲酸酯和羟苯甲酮等内分泌干扰物。这些物质会在潜水时直接冲入水中。',
    'EDCs can cause reproductive abnormalities, developmental disorders, and sex reversal in marine organisms. Coral larvae are particularly sensitive — EDC exposure can prevent them from settling and forming new colonies. These chemicals have been detected in seawater, sediments, and marine animals across the globe.': '内分泌干扰物可能导致海洋生物生殖异常、发育障碍和性别逆转。珊瑚幼体尤其敏感；暴露于内分泌干扰物可能阻止其附着并形成新群落。这些化学物质已在全球海水、沉积物和海洋动物中检出。',
    'Use reef-safe, paraben-free, and phthalate-free personal care products.': '使用对珊瑚礁更友好、不含对羟基苯甲酸酯和邻苯二甲酸酯的个人护理产品。',
    'Choose mineral-based sunscreens (zinc oxide or titanium dioxide) over chemical ones.': '优先选择矿物基防晒品（氧化锌或二氧化钛），而非化学防晒。',
    'Avoid chemical defoggers — simple spit or reef-safe alternatives work.': '避免化学防雾剂；简单唾液或对珊瑚礁更友好的替代品也可发挥作用。',
    'Rinse off on land, not in the ocean, and support better wastewater treatment in coastal communities.': '在陆地上冲洗，而不是在海里；并支持沿海社区改善废水处理。',
    'An ingredient label on a consumer product, illustrating one possible pathway for endocrine active chemicals.': '消费品上的成分标签，用来说明内分泌活性化学物质的一种可能路径。',
    'Attempted - try again': '已尝试 - 再试一次',
    'You tried this dive skill and recorded the result. Repeat the task with the lower-impact choice to turn this grey badge into a full patch.': '你已经尝试了这项潜水技能，并记录了结果。用更低影响的选择重做任务，就能把这枚灰色徽章转为完整徽章。',
    'Water Reader': '水样读者',
    'Hidden Evidence': '隐藏证据',
    'Sand Steward': '沙地守护者',
    'Patient Observer': '耐心观察者',
    'Seabed Keeper': '海床守护者',
    "Turtle's Pace": '海龟的节奏',
    'Responsible Diver': '负责任潜水者',
    'You learned to notice what a water sample can hold: small traces, living signals, and evidence that deserves a closer look.': '你学会了留意一份水样可能承载的东西：细小痕迹、生命信号，以及值得进一步观察的证据。',
    'Observe the sample carefully, record what you can identify, and recognise that clean-looking water can still carry invisible change.': '仔细观察样本，记录你能识别的内容，并意识到看似清澈的水也可能承载看不见的变化。',
    'You traced the small fragments that can move through a marine environment long after they have been discarded.': '你追踪了那些被丢弃很久后仍会在海洋环境中移动的细小碎片。',
    'Use the magnified sample to identify likely pollution, then connect the evidence to choices that prevent plastic entering the sea.': '使用放大的样本识别可能的污染，再把证据连接到防止塑料进入海洋的选择。',
    'You chose open sand for anchoring, leaving the reef clear of anchor weight, chain drag, and accidental contact.': '你选择在开阔沙地上下锚，让珊瑚礁避开锚的重量、锚链拖拽和意外接触。',
    'Steer toward a clear sandy patch before setting anchor. Reef structure is living habitat, not stable ground for a vessel.': '下锚前驶向清晰的沙地区域。珊瑚礁结构是活的栖息地，不是船只的稳定地面。',
    'You noticed movement inside marine debris and paused to understand the situation before taking action.': '你注意到海洋废弃物内部有动静，并在行动前停下来理解情况。',
    'Observe first. A discarded object can shelter or entangle marine life, so identify what is happening before intervening.': '先观察。废弃物可能庇护或缠住海洋生命，因此介入前先判断正在发生什么。',
    'You left a coral fragment where it lay, respecting the small shelter and future reef material already present on the seabed.': '你让珊瑚碎片留在原处，尊重海床上已有的小型庇护所和未来珊瑚礁材料。',
    'Do not collect coral fragments as souvenirs. Leave reef material in place unless trained local restoration teams direct otherwise.': '不要把珊瑚碎片当作纪念品收集。除非受过训练的当地修复团队另有指引，否则让珊瑚礁材料留在原处。',
    'You adjusted your route to travel alongside the turtle while keeping its natural path open and undisturbed.': '你调整路线，与海龟平行游动，同时让它的自然路径保持开放、不受干扰。',
    'Keep a respectful distance, travel parallel rather than chasing from behind, and let the turtle choose the length of the encounter.': '保持尊重的距离，平行游动而不是从后方追逐，并让海龟决定这次相遇持续多久。',
    'This completion mark records the habits you explored across the journey. It is a learning record, not a diving qualification.': '这枚完成徽章记录你在旅程中练习过的习惯。它是学习记录，不是潜水资格。',
    'Carry the four practices forward: read the evidence, reduce pollution, protect reef space, and allow marine life to choose its own path.': '把这四件事带到下一次下潜：读懂线索、减少污染、避开礁区、让海洋生命保有自己的路线。',
    'No personal pledge recorded.': '尚未记录个人承诺。',
    'Observe with care. Leave enough space for life to choose its own path.': '带着克制观察。给生命留下足够空间，让它选择自己的路径。',
    'TAKE ONLY MEMORIES.': '只带走记忆。',
    'LEAVE ONLY BUBBLES.': '只留下气泡。',
    'EDUCATIONAL SIMULATION — THIS RECORD DOES NOT CERTIFY DIVING COMPETENCE': '教育模拟 - 这不是潜水能力认证',
    'BlueTrace Responsible Diver Passport': 'BlueTrace 负责任潜水护照',
    'Educational record — not a diving qualification': '学习记录 - 非潜水资格',
    'Quiet Buoyancy': '安静浮力',
    'Respectful Witness': '尊重式观察',
    'Reef Keeper': '珊瑚礁守护者'
  };

  const translations = { zh };

  function translatePattern(text, language) {
    if (language !== 'zh') return text;
    const achievementNames = {
      'water reader': '水样读者',
      'hidden evidence': '隐藏证据',
      'sand steward': '沙地守护者',
      'patient observer': '耐心观察者',
      'seabed keeper': '海床守护者',
      "turtle's pace": '海龟的节奏',
      'responsible diver': '负责任潜水者'
    };
    let match = text.match(/^Observed (\d+) \/ 4$/);
    if (match) return `已观察 ${match[1]} / 4`;
    match = text.match(/^Explored (\d+) \/ 4$/);
    if (match) return `已探索 ${match[1]} / 4`;
    match = text.match(/^Vitality (\d+)%$/);
    if (match) return `活力 ${match[1]}%`;
    match = text.match(/^Vitality (\d+) percent, (.+) risk$/);
    if (match) return `活力 ${match[1]}%，${translate(match[2], language)}风险`;
    match = text.match(/^Reef response · pressure (\d+)\/100$/);
    if (match) return `珊瑚礁响应 · 压力 ${match[1]}/100`;
    match = text.match(/^Simulated (.+) exposure (\d+) of 100$/);
    if (match) return `模拟${translate(match[1], language)}暴露 ${match[2]} / 100`;
    match = text.match(/^Observation logged\\. (.+)$/);
    if (match) return `观察已记录。${translate(match[1], language)}`;
    match = text.match(/^Your personal ocean pledge: (.+)$/);
    if (match) return `你的个人海洋承诺：${match[1]}`;
    match = text.match(/^(Earned|Attempted|Locked) achievement: (.+)$/);
    if (match) {
      const state = { Earned: '已获得', Attempted: '已尝试', Locked: '已锁定' }[match[1]];
      const name = achievementNames[match[2]] || translate(match[2], language);
      return `${state}成就：${name}`;
    }
    match = text.match(/^(.+): (unlocked|locked)$/);
    if (match) return `${translate(match[1], language)}：${match[2] === 'unlocked' ? '已解锁' : '已锁定'}`;
    match = text.match(/^SAVED (.+)$/);
    if (match) return `保存于 ${match[1]}`;
    return text;
  }

  function translate(text, language = currentLanguage) {
    if (language === defaultLanguage) return text;
    const dictionary = translations[language] || {};
    const normalized = text.replace(/\s+/g, ' ').trim();
    return dictionary[text] || dictionary[normalized] || translatePattern(normalized, language);
  }

  function preserveWhitespace(original, translated) {
    const leading = original.match(/^\s*/)?.[0] || '';
    const trailing = original.match(/\s*$/)?.[0] || '';
    return `${leading}${translated}${trailing}`;
  }

  function getAttributeStore(element) {
    if (!originalAttributes.has(element)) originalAttributes.set(element, {});
    return originalAttributes.get(element);
  }

  function applyTextNode(node) {
    const value = node.nodeValue;
    const trimmed = value.trim();
    if (!trimmed) return;

    if (currentLanguage === defaultLanguage) {
      if (originalText.has(node)) node.nodeValue = originalText.get(node);
      return;
    }

    const translated = translate(trimmed, currentLanguage);
    if (translated !== trimmed) {
      originalText.set(node, value);
      node.nodeValue = preserveWhitespace(value, translated);
      return;
    }

    if (originalText.has(node)) {
      const original = originalText.get(node);
      node.nodeValue = preserveWhitespace(original, translate(original.trim(), currentLanguage));
    }
  }

  function applyAttributes(element) {
    const store = getAttributeStore(element);
    translatableAttributes.forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return;
      const value = element.getAttribute(attribute);
      if (!value) return;

      if (currentLanguage === defaultLanguage) {
        if (store[attribute]) element.setAttribute(attribute, store[attribute]);
        return;
      }

      const trimmed = value.trim();
      const translated = translate(trimmed, currentLanguage);
      if (translated !== trimmed) {
        store[attribute] = value;
        element.setAttribute(attribute, translated);
        return;
      }

      if (store[attribute]) {
        element.setAttribute(attribute, translate(store[attribute].trim(), currentLanguage));
      }
    });
  }

  function walk(root = document.body) {
    if (!root) return;
    if (root.nodeType === Node.ELEMENT_NODE) applyAttributes(root);

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode(node) {
          const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
          if (!element) return NodeFilter.FILTER_REJECT;
          if (element.closest('script, style, svg, canvas, video, audio')) return NodeFilter.FILTER_REJECT;
          if (element.closest('[data-i18n-ignore]')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) applyTextNode(node);
      if (node.nodeType === Node.ELEMENT_NODE) applyAttributes(node);
      node = walker.nextNode();
    }
  }

  function updateLanguageMenus() {
    document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';
    document.title = translate('BlueTrace - Immersive Ocean Journey', currentLanguage);
    document.querySelectorAll('[data-language-toggle]').forEach((button) => {
      button.textContent = currentLanguage === 'zh' ? '中' : 'EN';
      button.setAttribute('aria-label', translate('Open language menu', currentLanguage));
    });
    document.querySelectorAll('[data-language-option]').forEach((option) => {
      option.setAttribute('aria-current', option.getAttribute('lang') === (currentLanguage === 'zh' ? 'zh-CN' : 'en') ? 'true' : 'false');
    });
  }

  function applyLanguage(language) {
    currentLanguage = language === 'zh' || language === 'zh-CN' ? 'zh' : defaultLanguage;
    isApplying = true;
    walk(document.body);
    updateLanguageMenus();
    try {
      localStorage.setItem(languageStorageKey, currentLanguage);
    } catch {
      // Language preference still applies for this visit if storage is unavailable.
    }
    window.setTimeout(() => {
      isApplying = false;
    }, 0);
  }

  function installMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      if (isApplying || currentLanguage === defaultLanguage) return;
      window.requestAnimationFrame(() => {
        isApplying = true;
        mutations.forEach((mutation) => {
          if (mutation.type === 'characterData') {
            applyTextNode(mutation.target);
          } else if (mutation.type === 'attributes') {
            applyAttributes(mutation.target);
          } else {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.TEXT_NODE) applyTextNode(node);
              if (node.nodeType === Node.ELEMENT_NODE) walk(node);
            });
          }
        });
        updateLanguageMenus();
        window.setTimeout(() => {
          isApplying = false;
        }, 0);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: translatableAttributes
    });
  }

  function installLanguagePortalStyle() {
    const style = document.createElement('style');
    style.textContent = `
      .witness__language-menu.is-language-portal {
        position: fixed !important;
        z-index: 10000 !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        transform: translate3d(0, 0, 0) !important;
      }

      html[lang="zh-CN"] .witness__nav a,
      html[lang="zh-CN"] .about-page__nav a,
      html[lang="zh-CN"] .science-page__nav a,
      html[lang="zh-CN"] .field-notes-page__nav a,
      html[lang="zh-CN"] .witness__language-toggle,
      html[lang="zh-CN"] .witness__language-menu button,
      html[lang="zh-CN"] .console-top,
      html[lang="zh-CN"] .factor-tab,
      html[lang="zh-CN"] .eyebrow,
      html[lang="zh-CN"] .passport-topline,
      html[lang="zh-CN"] .record-item span,
      html[lang="zh-CN"] .record-item small,
      html[lang="zh-CN"] .section-label h3,
      html[lang="zh-CN"] .achievement figcaption b,
      html[lang="zh-CN"] .achievement figcaption span,
      html[lang="zh-CN"] .descent-link,
      html[lang="zh-CN"] .action-button {
        letter-spacing: 0.035em !important;
        text-transform: none !important;
      }

      html[lang="zh-CN"] .witness__nav-list {
        gap: clamp(0.7rem, 1.35vw, 1.5rem);
      }

      html[lang="zh-CN"] .witness__intro-line {
        font-size: clamp(3.2rem, 10vw, 7.1rem);
        letter-spacing: 0 !important;
        line-height: 0.98;
      }

      html[lang="zh-CN"] .witness__intro-subtitle,
      html[lang="zh-CN"] .witness__intro-kicker,
      html[lang="zh-CN"] .witness__intro-copy {
        letter-spacing: 0.035em !important;
        line-height: 1.55;
        text-wrap: balance;
      }

      html[lang="zh-CN"] #lab-title {
        letter-spacing: 0 !important;
        line-height: 0.92;
      }

      html[lang="zh-CN"] .lab-copy,
      html[lang="zh-CN"] .intro-copy,
      html[lang="zh-CN"] .field-notes-page__lead,
      html[lang="zh-CN"] .about-page__lead {
        letter-spacing: 0.025em !important;
        line-height: 1.72;
      }

      html[lang="zh-CN"] .factor-tabs {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.5rem;
      }

      html[lang="zh-CN"] .factor-tab {
        min-width: 0;
        padding-inline: 0.25rem;
        line-height: 1.45;
        word-break: keep-all;
        overflow-wrap: anywhere;
      }

      html[lang="zh-CN"] .console-top {
        gap: 1rem;
        flex-wrap: wrap;
        line-height: 1.5;
      }

      html[lang="zh-CN"] .lab-console {
        overflow: hidden !important;
      }

      html[lang="zh-CN"] .intro h1,
      html[lang="zh-CN"] .passport-heading h2 {
        letter-spacing: 0 !important;
        line-height: 0.96;
      }

      html[lang="zh-CN"] .achievement figcaption b {
        font-size: 12px;
        line-height: 1.25;
      }

      html[lang="zh-CN"] .achievement figcaption span {
        font-size: 9px;
        line-height: 1.35;
      }

      @media (max-width: 760px) {
        .witness__nav {
          z-index: 1000 !important;
          max-width: calc(100vw - 32px) !important;
          overflow-x: auto;
          overflow-y: visible;
        }

        .witness__nav-list {
          min-width: 100%;
        }

        .witness__language {
          order: -1;
          position: sticky;
          left: 0;
          z-index: 1001;
          padding-right: 0.35rem;
        }

        html[lang="zh-CN"] .witness__nav-list {
          gap: 0.85rem;
          padding-right: 1rem;
        }

        html[lang="zh-CN"] .witness__nav a,
        html[lang="zh-CN"] .about-page__nav a,
        html[lang="zh-CN"] .science-page__nav a,
        html[lang="zh-CN"] .field-notes-page__nav a {
          font-size: 0.68rem !important;
          letter-spacing: 0.025em !important;
        }

        html[lang="zh-CN"] .witness__intro {
          width: calc(100% - 32px);
          max-width: 24rem;
          min-height: auto;
        }

        html[lang="zh-CN"] .witness__intro-line {
          font-size: clamp(3.1rem, 17vw, 4.6rem);
          line-height: 1.02;
        }

        html[lang="zh-CN"] .witness__intro-subtitle {
          margin-top: 0.55rem;
          font-size: 0.74rem;
        }

        html[lang="zh-CN"] #lab-title {
          font-size: clamp(4.5rem, 20vw, 6.7rem);
          line-height: 0.88;
        }

        html[lang="zh-CN"] .lab-copy {
          font-size: clamp(1.02rem, 4.8vw, 1.34rem);
          line-height: 1.58;
        }

        html[lang="zh-CN"] .factor-tabs {
          gap: 0.3rem;
        }

        html[lang="zh-CN"] .factor-tab {
          font-size: 0.62rem;
          min-height: 54px;
        }

        html[lang="zh-CN"] .intro h1 {
          font-size: clamp(3rem, 14vw, 4.2rem);
          line-height: 0.98;
        }

        html[lang="zh-CN"] .intro-copy {
          margin-top: 28px;
          line-height: 1.68;
        }

        html[lang="zh-CN"] .passport-heading h2 {
          font-size: clamp(2.9rem, 16vw, 4.4rem);
        }

        html[lang="zh-CN"] .record-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        html[lang="zh-CN"] .record-item {
          min-width: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function openLanguagePortal(menu) {
    const list = menu.querySelector('.witness__language-menu') || portalMenus.get(menu);
    const toggle = menu.querySelector('[data-language-toggle]');
    if (!list || !toggle) return;
    const rect = toggle.getBoundingClientRect();
    const width = Math.min(156, Math.max(128, window.innerWidth - 32));
    const left = Math.min(Math.max(16, rect.right - width), window.innerWidth - width - 16);
    const top = Math.min(rect.bottom + 8, window.innerHeight - 96);
    portalMenus.set(menu, list);
    document.body.appendChild(list);
    list.classList.add('is-language-portal');
    list.style.width = `${width}px`;
    list.style.left = `${left}px`;
    list.style.right = 'auto';
    list.style.top = `${top}px`;
  }

  function closeLanguageMenu(menu) {
    const list = portalMenus.get(menu);
    menu.classList.remove('is-open');
    menu.querySelector('[data-language-toggle]')?.setAttribute('aria-expanded', 'false');
    if (list) {
      list.classList.remove('is-language-portal');
      list.removeAttribute('style');
      menu.appendChild(list);
      portalMenus.delete(menu);
    }
  }

  function closeLanguageMenus(except = null) {
    document.querySelectorAll('[data-language-menu]').forEach((menu) => {
      if (menu === except) return;
      closeLanguageMenu(menu);
    });
  }

  function toggleLanguageMenu(menu) {
    const willOpen = !menu.classList.contains('is-open');
    closeLanguageMenus(menu);
    menu.classList.toggle('is-open', willOpen);
    menu.querySelector('[data-language-toggle]')?.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) {
      openLanguagePortal(menu);
    } else {
      closeLanguageMenu(menu);
    }
  }

  function installLanguageControls() {
    document.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-language-toggle]');
      if (toggle) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const menu = toggle.closest('[data-language-menu]');
        if (menu) toggleLanguageMenu(menu);
        return;
      }

      const option = event.target.closest('[data-language-option]');
      if (option) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const language = option.getAttribute('lang') === 'zh-CN' ? 'zh' : defaultLanguage;
        applyLanguage(language);
        closeLanguageMenus();
        return;
      }

      if (!event.target.closest('[data-language-menu]') && !event.target.closest('.is-language-portal')) closeLanguageMenus();
    }, true);
  }

  function getSavedLanguage() {
    try {
      return localStorage.getItem(languageStorageKey) || defaultLanguage;
    } catch {
      return defaultLanguage;
    }
  }

  window.BlueTraceI18n = {
    setLanguage: applyLanguage,
    getLanguage: () => currentLanguage,
    refresh: () => {
      isApplying = true;
      walk(document.body);
      updateLanguageMenus();
      window.setTimeout(() => {
        isApplying = false;
      }, 0);
    },
    t: translate
  };

  installLanguagePortalStyle();
  installLanguageControls();
  installMutationObserver();
  applyLanguage(getSavedLanguage());
})();

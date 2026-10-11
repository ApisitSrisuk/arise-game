/* ================= SECONDARY CLASSES =================
   Opens at SUB_LV. The system offers SUB_OFFER rolled choices (each with a grade C–S); the player keeps one.
   A secondary class gives its fx bonuses (scaled by grade like passives) and one active skill, registered in ACT as 'sub_'+id.
   When the main class is in its `pair` list the fx bonuses are multiplied by SUB_PAIR.
   Rerolling the offer costs SUB_REROLL awakening stones. w is the roll weight. */
export const SUB_LV=10,SUB_OFFER=3,SUB_PAIR=1.5,SUB_REROLL=1;
export const SUBCLASSES=[
 /* ---------- C ---------- */
 {id:'apothecary',name:'นักปรุงยา',rar:'C',w:10,desc:'ต้มยาสมุนไพรเองได้ ยาทุกขวดจึงแรงกว่าที่ร้านขาย',
  fx:{potion:40,healamp:10},act:{n:'ยาเร่งด่วน',mp:8,fx:{heal:.3}},pair:['healer','alchemist','druid']},
 {id:'blacksmith',name:'ช่างตีเหล็ก',rar:'C',w:10,desc:'ดูแลอาวุธและเกราะของตัวเองทุกวัน ทุกชิ้นจึงคมและแน่นกว่าปกติ',
  fx:{atkp:6,defp:6},act:{n:'ลับคมกลางสนาม',mp:8,fx:{buff:.3}},pair:['fighter','tank','merchant']},
 {id:'explorer',name:'นักสำรวจ',rar:'C',w:10,desc:'เดินดันเจี้ยนมามากจนรู้ว่าควรเก็บแรงไว้ตรงไหน',
  fx:{stasave:15,stamflat:15},act:{n:'แสงแฟลชตาพร่า',mp:9,fx:{stun:1,evade:1}},pair:['ranger','thief','underdog']},
 {id:'cook',name:'พ่อครัว',rar:'C',w:10,desc:'ทำอาหารบำรุงกำลังพกติดตัว กินแล้วหายเหนื่อยทันที',
  fx:{regen:2,stam:10},act:{n:'อาหารบำรุงกำลัง',mp:9,fx:{heal:.25,buff:.15}},pair:['brawler','berserker','tank']},
 {id:'treasure',name:'นักล่าสมบัติ',rar:'C',w:10,desc:'จมูกไวต่อของมีค่า และตาไวต่อจุดอ่อนของศัตรูพอๆ กัน',
  fx:{gold:25,xp:5},act:{n:'ขุดหาจุดอ่อน',mp:8,fx:{m:1.3,crit:1}},pair:['thief','merchant','gambler']},
 /* ---------- B ---------- */
 {id:'tamer',name:'นักฝึกสัตว์',rar:'B',w:6,desc:'มีหมาป่าคู่ใจคอยตามติด พร้อมกระโจนใส่ศัตรูเมื่อได้รับคำสั่ง',
  fx:{double:8,hpmax:5},act:{n:'สั่งหมาป่าขย้ำ',mp:9,fx:{m:.8,hits:3}},pair:['ranger','druid']},
 {id:'scribe',name:'นักเขียนอักขระ',rar:'B',w:6,desc:'สลักอักขระเวทลงบนอาวุธและร่างกาย สกิลทุกอย่างจึงแรงขึ้น',
  fx:{skillamp:10,manaflow:8},act:{n:'อักขระระเบิด',mp:10,fx:{m:1.8,pierce:1}},pair:['mage','warlock','starcaller']},
 {id:'instructor',name:'ครูฝึกการต่อสู้',rar:'B',w:6,desc:'สอนวิชาต่อสู้ให้ฮันเตอร์รุ่นน้อง จนอ่านจังหวะศัตรูออกทุกท่า',
  fx:{counter:12,critdmg:15},act:{n:'บทเรียนราคาแพง',mp:10,fx:{m:1.5,stun:1}},pair:['brawler','ronin','fighter']},
 {id:'acolyte',name:'นักบวชฝึกหัด',rar:'B',w:6,desc:'สวดภาวนาทุกเช้า แสงศักดิ์สิทธิ์จึงคอยคุ้มครองอยู่เสมอ',
  fx:{healamp:15,regen:1},act:{n:'สวดภาวนา',mp:10,fx:{heal:.3,guard:1}},pair:['paladin','healer','fallen']},
 {id:'mercenary',name:'ทหารรับจ้าง',rar:'B',w:6,desc:'รับงานล่าบอสแลกค่าจ้าง ยิ่งเป้าหมายใหญ่ยิ่งได้เงินเยอะ',
  fx:{bossdmg:12,gold:10},act:{n:'ฟันตามค่าจ้าง',mp:9,fx:{m:2}},pair:['fighter','berserker','wargod']},
 /* ---------- A ---------- */
 {id:'sealer',name:'นักเวทผนึก',rar:'A',w:3,desc:'ผู้เชี่ยวชาญตราผนึก ตรึงศัตรูให้ขยับไม่ได้',
  fx:{stunchance:8,enemyweak:6},act:{n:'ตราผนึก',mp:11,fx:{m:.6,stun:2}},pair:['bard','mage','chrono']},
 {id:'guardian',name:'ผู้พิทักษ์',rar:'A',w:3,desc:'สาบานว่าจะไม่ล้มก่อนคนที่ตัวเองปกป้อง',
  fx:{startguard:1,hpmax:8},act:{n:'ปกป้องสุดชีวิต',mp:10,fx:{guard:2,heal:.1}},pair:['tank','paladin','goldking']},
 {id:'poisoner',name:'นักวางยาพิษ',rar:'A',w:3,desc:'รู้จักพิษทุกชนิดในดันเจี้ยน และรู้ว่าควรทาลงตรงไหน',
  fx:{poisonhit:12,burnamp:20},act:{n:'ละอองพิษ',mp:9,fx:{burn:4,weak:1}},pair:['assassin','alchemist','druid','warlock']},
 {id:'astrologer',name:'โหราจารย์',rar:'A',w:3,desc:'อ่านชะตาจากดวงดาว รู้ล่วงหน้าว่าศัตรูจะเปิดช่องตอนไหน',
  fx:{xp:12,crit:4},act:{n:'ทำนายจุดตาย',mp:11,fx:{m:1.6,crit:1,pierce:1}},pair:['bard','starcaller','gambler']},
 /* ---------- S ---------- */
 {id:'contractor',name:'ผู้ทำสัญญาปีศาจ',rar:'S',w:1,desc:'แลกเลือดของตัวเองกับพลังจากนรก ยิ่งบาดเจ็บยิ่งอันตราย',
  fx:{ls:6,berserk:15},act:{n:'สัญญาเลือด',mp:10,fx:{m:3,hpcost:.08,drain:.2}},pair:['bloodblade','warlock','demonking']},
 {id:'blessed',name:'ผู้รับพรเทพ',rar:'S',w:1,desc:'ได้รับพรจากเทพองค์หนึ่งตั้งแต่วันที่ปลุกพลัง',
  fx:{hpmax:6,atkp:6,xp:8},act:{n:'พรแห่งเทพ',mp:12,fx:{buff:.35,heal:.3}},pair:['healer','paladin','fallen']},
 {id:'heir',name:'ผู้สืบทอดวิชาลับ',rar:'S',w:1,desc:'ทายาทของสำนักที่สาบสูญ ได้รับวิชาที่ห้ามใช้ต่อหน้าผู้อื่น',
  fx:{extraturn:4,skillamp:8},act:{n:'วิชาลับต้องห้าม',mp:13,fx:{m:2.8,pierce:1}},pair:['ronin','assassin','chrono','perfect']},
 {id:'shadowhunter',name:'นักล่าเงา',rar:'S',w:1,desc:'ผู้ไล่ล่าสิ่งที่ซ่อนอยู่ในความมืด จนความมืดยอมรับเป็นพวก',
  fx:{shadowp:15,arise:8,dodge:4},act:{n:'เงาพันธนาการ',mp:10,fx:{m:1.4,stun:1}},pair:['monarch','assassin','thief']},
];
export const SUB=Object.fromEntries(SUBCLASSES.map(s=>[s.id,s]));

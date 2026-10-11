import { fmt } from './util.js';
import { XACT, XCLASSES } from './expansion.js';
import { SUBCLASSES } from './subclass.js';

export const KT={atkp:'ATK +{v}%',defp:'DEF +{v}%',crit:'คริติคอล +{v}%',critdmg:'ดาเมจคริติคอล +{v}%',dodge:'หลบหลีก +{v}%',regen:'ฟื้น HP {v}% ทุกเทิร์น',
 ls:'ดูด HP {v}% ของดาเมจ',mpr:'ฟื้น MP +{v} ต่อเทิร์น',counter:'โอกาส {v}% โจมตีสวนเมื่อโดนตี',double:'โอกาส {v}% โจมตีซ้ำ',berserk:'ATK +{v}% เมื่อ HP ต่ำกว่า 40%',
 thorns:'สะท้อนดาเมจ {v}%',gold:'ทอง +{v}%',xp:'EXP +{v}%',potion:'ยาได้ผล +{v}%',firststrike:'การโจมตีแรกใส่ศัตรูแต่ละตัวคริติคอลเสมอ',undying:'รอดจากความตายได้ {v} ครั้งต่อเกต',
 shadowp:'พลังเงา +{v}%',stam:'สตามินาสูงสุด +{v}%',stamflat:'สตามินาสูงสุด +{v}',poisonhit:'โอกาส {v}% ทำให้ศัตรูติดดาเมจต่อเนื่องเมื่อโจมตี',arise:'โอกาส ARISE +{v}%',
 manaflow:'สกิลใช้ MP น้อยลง {v}%',killheal:'ฆ่าศัตรูแล้วฟื้น HP {v}%',killmp:'ฆ่าศัตรูแล้วฟื้น MP {v}%',bossdmg:'ดาเมจใส่บอสและยอดฝีมือ +{v}%',skillamp:'ดาเมจสกิล +{v}%',
 healamp:'การฟื้น HP แรงขึ้น {v}%',burnamp:'ดาเมจต่อเนื่อง +{v}%',startguard:'เริ่มทุกการต่อสู้ด้วยการป้องกัน {v} เทิร์น',lowhpboost:'ATK และ DEF +{v}% เมื่อ HP ต่ำกว่าครึ่ง',
 extrahit:'โจมตีปกติแถมอีก 1 ครั้ง แรง {v}%',extraturn:'โอกาส {v}% ได้เล่นต่อทันทีโดยศัตรูไม่ได้โต้',enemyweak:'ศัตรูเริ่มต่อสู้ด้วย ATK -{v}%',stasave:'สตามินาที่ใช้ในเกตลดลง {v}%',
 stunchance:'โอกาส {v}% ทำให้ศัตรูชะงักเมื่อโจมตี',shslots:'ช่องเงาเพิ่ม {v} ช่อง',hpmax:'HP สูงสุด +{v}%',mpmax:'MP สูงสุด +{v}%',extract:'สั่ง ARISE ดึงเงาบอสมาเป็นทหารได้'};
export const FLATK=new Set(['firststrike','undying','startguard','shslots','stamflat','extract']);
export const fxText=(fx,q=1)=>Object.entries(fx).map(([k,v])=>KT[k].replace('{v}',fmt(FLATK.has(k)?v:v*q))).join(' · ');

/* ================= DATA ================= */
export const STATS=[['str','พลัง','STR'],['agi','ความเร็ว','AGI'],['int','สติปัญญา','INT'],['vit','ความทนทาน','VIT'],['per','การรับรู้','PER']];
export const GR={C:{m:1},B:{m:1.15},A:{m:1.3},S:{m:1.5}};
export const GORDER=['C','B','A','S'];
export function rollGrade(){const r=Math.random()*100;return r<7?'S':r<25?'A':r<55?'B':'C'}
export const nextGrade=g=>GORDER[Math.min(3,GORDER.indexOf(g)+1)];

export const ACT={
 slash:{n:'ฟันทลาย',mp:8,fx:{m:2.1,pierce:1}},whirl:{n:'ดาบหมุนพายุ',mp:10,fx:{m:.9,hits:3}},warcry:{n:'คำรามศึก',mp:9,fx:{buff:.4}},execute:{n:'ประหาร',mp:12,fx:{m:1.5,exec:1}},
 fortress:{n:'ป้อมปราการ',mp:10,fx:{guard:2,heal:.15}},shieldbash:{n:'โล่กระแทก',mp:9,fx:{m:1.4,stun:1,pierce:1}},taunt:{n:'ข่มขวัญ',mp:8,fx:{m:1,weak:1}},ironwall:{n:'กำแพงเหล็ก',mp:12,fx:{guard:3}},
 triple:{n:'ยิงสามดอก',mp:9,fx:{m:.95,hits:3}},snipe:{n:'ยิงเจาะเกราะ',mp:10,fx:{m:2.4,pierce:1}},poisonarrow:{n:'ลูกธนูพิษ',mp:8,fx:{m:1.2,burn:3}},arrowrain:{n:'ฝนลูกธนู',mp:13,fx:{m:.6,hits:5}},
 fireball:{n:'ลูกไฟระเบิด',mp:12,fx:{m:2.8,pierce:1}},frostlance:{n:'หอกน้ำแข็ง',mp:11,fx:{m:1.8,stun:1}},chainbolt:{n:'สายฟ้าลูกโซ่',mp:13,fx:{m:1.1,hits:3,pierce:1}},manashield:{n:'โล่มานา',mp:10,fx:{guard:2,heal:.1}},
 lightheal:{n:'แสงฟื้นฟู',mp:10,fx:{heal:.45}},smite:{n:'ทัณฑ์สวรรค์',mp:11,fx:{m:2,pierce:1,burn:2}},blessing:{n:'พรศักดิ์สิทธิ์',mp:10,fx:{buff:.3,heal:.2}},sanctuary:{n:'เขตศักดิ์สิทธิ์',mp:14,fx:{guard:2,heal:.25}},
 vital:{n:'แทงจุดตาย',mp:11,fx:{m:2.2,crit:1}},shadowstep:{n:'ก้าวเงา',mp:9,fx:{m:1.6,evade:1}},venomknife:{n:'มีดอาบพิษ',mp:8,fx:{m:1.3,burn:4}},flurry:{n:'พันคมมีด',mp:12,fx:{m:.75,hits:4}},
 army:{n:'กองทัพเงา',mp:14,fx:{army:2.2}},thunderrush:{n:'จู่โจมสายฟ้า',mp:10,fx:{m:1.5,hits:2}},kingdom:{n:'อำนาจราชันย์',mp:12,fx:{m:1.2,stun:1,weak:1}},shadowhand:{n:'มือแห่งเงา',mp:11,fx:{m:2,pierce:1,drain:.3}},
 bloodoffer:{n:'โลหิตบูชา',mp:10,fx:{m:2.6,drain:.4}},frenzy:{n:'คลั่งโลหิต',mp:6,fx:{m:3.6,hpcost:.1}},crimsonmoon:{n:'จันทร์แดง',mp:13,fx:{m:1,hits:3,drain:.2}},hemorrhage:{n:'เลือดไหลไม่หยุด',mp:9,fx:{m:1.2,burn:4}},
 breath:{n:'ลมหายใจมังกร',mp:14,fx:{m:3,pierce:1,burn:3}},wingstorm:{n:'พายุปีก',mp:11,fx:{m:1,hits:3}},dragonscale:{n:'เกล็ดมังกร',mp:11,fx:{guard:3,heal:.1}},roar:{n:'คำรามมังกร',mp:10,fx:{m:1,stun:1,weak:1}},
 timestop:{n:'หยุดเวลา',mp:20,fx:{m:1.5,stun:2}},rewind:{n:'ย้อนเวลา',mp:14,fx:{heal:.5}},accel:{n:'เร่งเวลา',mp:13,fx:{m:.9,hits:4}},paradox:{n:'ปฏิทรรศน์',mp:16,fx:{m:2.2,pierce:1,crit:1}},
 hellfire:{n:'เพลิงนรก',mp:13,fx:{m:2.4,pierce:1,weak:1}},dominion:{n:'คำสั่งราชาปีศาจ',mp:14,fx:{m:1.8,stun:1}},soulreap:{n:'กัดกินวิญญาณ',mp:12,fx:{m:2,drain:.5}},apocalypse:{n:'วันสิ้นโลก',mp:25,fx:{m:4.2,pierce:1}},
 lifeburst:{n:'ระเบิดชีวิต',mp:12,fx:{m:1.5,missing:.8,pierce:1}},reaper:{n:'เคียวยมทูต',mp:12,fx:{m:1.6,exec:1}},deathaura:{n:'ออร่ามรณะ',mp:10,fx:{burn:4,weak:1}},rebirth:{n:'คืนชีพ',mp:14,fx:{heal:.5}},
};

/* every class: own trait, own 5 passives, own 4 actives, own awakening */
export const CLASSES=[
 {id:'fighter',name:'นักรบ',rar:'C',w:12,main:'str',outfit:'jacket',base:{str:5,agi:2,int:0,vit:3,per:1},desc:'นักสู้แนวหน้า ใช้พลังกายบดขยี้ศัตรูตรงๆ',
  trait:{n:'ร่างกายนักสู้',fx:{atkp:10}},act:['slash','whirl','warcry','execute'],
  pas:[['f1','เลือดนักสู้',{berserk:40}],['f2','ดาบสองจังหวะ',{double:18}],['f3','กล้ามเนื้อเหล็ก',{defp:12,hpmax:8}],['f4','สัญชาตญาณสวนกลับ',{counter:22}],['f5','ล่าผู้แข็งแกร่ง',{bossdmg:20}]],
  art:[['sword'],{c:'#2a2a33',d:'#3a6fc4',a:'#c9d2dc',p:'#2a3550',b:'#1e1e24',w:'#e2e8f0',k:'#3a2a1a',y:'#c9a46a'}],
  aw:{name:'จอมทัพสงคราม',trait:{n:'ไม่มีวันถอย',fx:{lowhpboost:25}},ult:{n:'ฟันแยกสวรรค์',mp:22,fx:{m:4.5,pierce:1}},ov:['cape'],pal:{r:'#8a1a1a',ry:'#ffd34d',w:'#ffe9a8',y:'#ffd34d'},glow:'#ffd34d'}},
 {id:'tank',name:'แทงค์',rar:'C',w:11,main:'str',outfit:'tactical',base:{str:3,agi:0,int:0,vit:7,per:2},desc:'กำแพงมนุษย์ที่ยืนรับทุกการโจมตีแทนทีม',
  trait:{n:'กำแพงมนุษย์',fx:{defp:25}},act:['fortress','shieldbash','taunt','ironwall'],
  pas:[['t1','หนามโล่',{thorns:30}],['t2','ยืนหยัด',{hpmax:15}],['t3','โต้กลับหนักหน่วง',{counter:18,defp:5}],['t4','ฟื้นตัวไว',{regen:3}],['t5','ท่าตั้งรับ',{startguard:1}]],
  art:[['visor','shield'],{c:'#3a4a5a',d:'#232a33',a:'#ffd34d',p:'#2a3038',b:'#1a1e24',hm:'#4a5a6a',ha:'#7fe7ff',sm:'#c9d2dc',sa:'#3a6fc4',sy:'#8a94a2',w:'#c9d2dc'}],
  aw:{name:'ป้อมปราการมีชีวิต',trait:{n:'ปราการไม่สั่นคลอน',fx:{startguard:2,hpmax:10}},ult:{n:'กำแพงพิพากษา',mp:20,fx:{m:2.5,stun:1,guard:2}},ov:['crownh'],pal:{sy:'#ffd34d',ha:'#ffe9a8',hk:'#ffd34d'},glow:'#ffe9a8'}},
 {id:'ranger',name:'นักธนู',rar:'C',w:11,main:'agi',outfit:'hoodie',base:{str:1,agi:6,int:0,vit:2,per:3},desc:'นักล่าระยะไกล คล่องแคล่วและหลบหลีกเก่ง',
  trait:{n:'สายลม',fx:{dodge:6}},act:['triple','snipe','poisonarrow','arrowrain'],
  pas:[['r1','ตาเหยี่ยว',{crit:10}],['r2','ลูกศรอาบพิษ',{poisonhit:22}],['r3','ฝีเท้าสายลม',{dodge:7}],['r4','ยิงต่อเนื่อง',{extrahit:35}],['r5','นักล่าผู้อดทน',{stasave:15}]],
  art:[['cap','bow','quiver'],{c:'#3f7a3a',d:'#24502b',a:'#e8e2c8',p:'#3a3a44',b:'#e9eef5',o:'#24502b',ha:'#e8e2c8',k:'#6b4a2b',y:'#c9a46a',qk:'#5a3a22',qa:'#e8e2c8'}],
  aw:{name:'นักแม่นธนูเงาจันทร์',trait:{n:'ศรคู่',fx:{extrahit:60}},ult:{n:'ลูกศรพิฆาตดาว',mp:20,fx:{m:1.1,hits:6}},ov:['cape'],pal:{c:'#2b5f7a',d:'#1d3b4f',o:'#16263a',r:'#16263a',qa:'#bfe9ff',y:'#bfe9ff'},glow:'#9fe0ff'}},
 {id:'mage',name:'นักเวท',rar:'B',w:5.5,main:'int',outfit:'uniform',base:{str:0,agi:1,int:7,vit:1,per:2},desc:'ผู้ใช้เวทธาตุ พลังทำลายสูงแต่ร่างกายบอบบาง',
  trait:{n:'ร่างมานา',fx:{mpr:2}},act:['fireball','frostlance','chainbolt','manashield'],
  pas:[['m1','ไหลเวียนมานา',{manaflow:20}],['m2','ขยายเวท',{skillamp:18}],['m3','คลังมานา',{mpmax:25}],['m4','สะท้อนจิต',{killmp:15}],['m5','เวทสะกด',{stunchance:10}]],
  art:[['glasses','staff'],{c:'#2c1f66',d:'#e9eef5',a:'#ffcc55',p:'#1e1446',b:'#1a1028',ha:'#2a2a33',hg:'#bfe9ff',k:'#4a2a1a',y:'#ffcc55',g:'#ff8a3d'}],
  aw:{name:'จอมปราชญ์ธาตุ',trait:{n:'ขยายเวทสูงสุด',fx:{skillamp:25}},ult:{n:'อุกกาบาตพิโรธ',mp:26,fx:{m:5,pierce:1,burn:3}},ov:['hat','cape'],pal:{o:'#1e1446',ha:'#ffcc55',r:'#3b2a7a',g:'#ff5a2a'},glow:'#ff8a3d'}},
 {id:'healer',name:'ฮีลเลอร์',rar:'B',w:4.5,main:'int',outfit:'coat',base:{str:0,agi:1,int:5,vit:4,per:2},desc:'ผู้ใช้พลังแห่งแสง ยิ่งสู้นานยิ่งได้เปรียบ',
  trait:{n:'พรแห่งแสง',fx:{regen:4}},act:['lightheal','smite','blessing','sanctuary'],
  pas:[['h1','มือแห่งการเยียวยา',{healamp:30}],['h2','นักปรุงยาศักดิ์สิทธิ์',{potion:50}],['h3','ศรัทธาแรงกล้า',{defp:8,mpr:2}],['h4','พรแห่งชีวิต',{killheal:10}],['h5','ร่างศักดิ์สิทธิ์',{hpmax:10,regen:1}]],
  art:[['crossstaff'],{c:'#eef2f7',d:'#b9c6d6',a:'#7fd8c0',p:'#4a5a6a',b:'#e9eef5',k:'#d4af37',y:'#ffd166',g:'#7fe7ff'}],
  aw:{name:'นักบุญ',trait:{n:'พระหัตถ์ศักดิ์สิทธิ์',fx:{healamp:40,mpr:2}},ult:{n:'ปาฏิหาริย์',mp:24,fx:{heal:1,guard:2}},ov:['halo','cape'],pal:{r:'#f4f1ff',hy:'#ffe27a',y:'#ffe27a'},glow:'#fff3b0'}},
 {id:'assassin',name:'นักฆ่า',rar:'A',w:2.5,main:'agi',outfit:'hoodie',base:{str:3,agi:7,int:0,vit:1,per:4},desc:'เคลื่อนไหวในเงามืด จบศัตรูในไม่กี่ครั้ง',
  trait:{n:'เพชฌฆาต',fx:{crit:15}},act:['vital','shadowstep','venomknife','flurry'],
  pas:[['a1','จู่โจมก่อน',{firststrike:1}],['a2','สังหารเลือดเย็น',{critdmg:40}],['a3','ใบมีดพิษ',{poisonhit:15,crit:4}],['a4','เงาพราง',{dodge:8,extraturn:5}],['a5','นักล่าค่าหัว',{gold:30,bossdmg:10}]],
  art:[['hood','mask','daggers'],{c:'#1d1f2b',d:'#14151e',a:'#8b1e2e',p:'#14151e',b:'#111111',o:'#1d1f2b',ha:'#8b1e2e',w:'#d6dde6',y:'#8b1e2e'}],
  aw:{name:'ราชาเพชฌฆาต',trait:{n:'เก็บเกี่ยววิญญาณ',fx:{killmp:30,critdmg:20}},ult:{n:'ประหารในเงา',mp:20,fx:{m:3,crit:1,exec:1}},ov:['cape'],pal:{r:'#2a0a12',ha:'#ff3355'},glow:'#ff3355'}},
 {id:'monarch',name:'ผู้ปลุกเงา',rar:'S',w:1,hidden:1,main:'int',outfit:'coat',base:{str:4,agi:4,int:5,vit:3,per:4},desc:'ผู้สืบทอดพลังแห่งเงา ดึงเงาของบอสที่ล้มลงมาเป็นทหารรับใช้',
  trait:{n:'สกัดเงา',fx:{extract:1}},act:['army','thunderrush','kingdom','shadowhand'],
  pas:[['s1','เจตจำนงราชันย์',{shadowp:30}],['s2','เสียงเรียกจากความมืด',{arise:15}],['s3','ขยายอาณาจักร',{shslots:1}],['s4','ดูดกลืนเงา',{ls:8}],['s5','ความกลัวแห่งราชันย์',{enemyweak:10}]],
  art:[['hood','daggers'],{c:'#151525',d:'#0a0a12',a:'#a37bff',p:'#101018',b:'#08080c',o:'#0c0c14',w:'#a37bff',y:'#c9a6ff'}],
  aw:{name:'ราชันย์แห่งเงา',trait:{n:'อาณาจักรแห่งเงา',fx:{shadowp:50,shslots:2}},ult:{n:'กองทัพมืดบดขยี้',mp:28,fx:{army:4}},ov:['cape','crownh'],pal:{r:'#1a1030',ry:'#a37bff',hk:'#a37bff',y:'#a37bff'},glow:'#a37bff'}},
 {id:'bloodblade',name:'จอมดาบโลหิต',rar:'SS',w:.3,hidden:1,main:'str',outfit:'coat',base:{str:7,agi:3,int:0,vit:4,per:2},desc:'นักดาบที่ใช้เลือดของตัวเองและศัตรูเป็นพลัง',
  trait:{n:'คมดาบกระหายเลือด',fx:{ls:10}},act:['bloodoffer','frenzy','crimsonmoon','hemorrhage'],
  pas:[['b1','กระหายเลือด',{berserk:35,ls:3}],['b2','เลือดเดือด',{atkp:12}],['b3','ฟื้นจากเลือดศัตรู',{killheal:12}],['b4','คมดาบแดงฉาน',{critdmg:30,crit:3}],['b5','สัญญาโลหิต',{undying:1}]],
  art:[['cape','greatsword'],{c:'#3a0f18',a:'#d22c3c',d:'#22070c',r:'#7a0f1e',x:'#d22c3c',g:'#ff3040',e:'#ff3040',p:'#22070c',b:'#111111'}],
  aw:{name:'ราชันย์โลหิต',trait:{n:'ราชาแห่งเลือด',fx:{killheal:20}},ult:{n:'ทะเลเลือด',mp:24,fx:{m:2,hits:3,drain:.5}},ov:['crownh'],pal:{hk:'#d22c3c',y:'#d22c3c'},glow:'#ff3040'}},
 {id:'dragon',name:'ผู้สืบสายมังกร',rar:'SS',w:.25,hidden:1,main:'int',outfit:'robe',base:{str:4,agi:2,int:6,vit:5,per:2},desc:'มนุษย์ที่มีเลือดมังกรไหลเวียน ทั้งเผาและทนทาน',
  trait:{n:'เลือดมังกร',fx:{thorns:20}},act:['breath','wingstorm','dragonscale','roar'],
  pas:[['d1','เกล็ดเหล็กมังกร',{defp:15,thorns:10}],['d2','เปลวเพลิงไม่ดับ',{burnamp:50}],['d3','ไฟลุกโชน',{poisonhit:20}],['d4','หัวใจมังกร',{hpmax:15,regen:1}],['d5','โทสะมังกร',{bossdmg:25}]],
  art:[['cape','horns','staff'],{n:'#f5deb3',c:'#9a2a12',a:'#ffb020',d:'#5c1408',g:'#ff4d1a',r:'#5c1408',k:'#3a1a0d'}],
  aw:{name:'มังกรจุติ',trait:{n:'เปลวเพลิงบรรพกาล',fx:{burnamp:100}},ult:{n:'เพลิงสิ้นยุค',mp:28,fx:{m:4,pierce:1,burn:5}},ov:['crownh'],pal:{y:'#ffb020',n:'#ffd34d'},glow:'#ff6a1a'}},
 {id:'chrono',name:'ผู้หยุดกาลเวลา',rar:'SSS',w:.1,hidden:1,main:'agi',outfit:'suit',base:{str:2,agi:6,int:6,vit:3,per:5},desc:'ผู้อยู่นอกกระแสเวลา หยุดและย้อนเวลาได้ตามใจ',
  trait:{n:'นอกกาลเวลา',fx:{dodge:12}},act:['timestop','rewind','accel','paradox'],
  pas:[['c1','ก้าวล่วงหน้า',{extraturn:12}],['c2','ย้อนบาดแผล',{regen:4}],['c3','ความรู้จากอนาคต',{xp:30}],['c4','จังหวะเวลาสมบูรณ์',{manaflow:15,crit:5}],['c5','เวลาที่ยืดออก',{stasave:20}]],
  art:[['circlet','staff','cape'],{c:'#f4f1ff',d:'#3b4a8c',a:'#7fe7ff',p:'#e2ddf5',b:'#3b4a8c',ha:'#d4af37',hg:'#7fe7ff',r:'#3b4a8c',ry:'#7fe7ff',k:'#d4af37',y:'#ffd34d',g:'#7fe7ff'}],
  aw:{name:'ผู้ปกครองกาลเวลา',trait:{n:'เวลาเหลื่อม',fx:{extraturn:20}},ult:{n:'โลกหยุดหมุน',mp:30,fx:{m:2,stun:3}},ov:['halo'],pal:{hy:'#7fe7ff',y:'#7fe7ff'},glow:'#7fe7ff'}},
 {id:'demonking',name:'ราชาปีศาจ',rar:'???',w:0,hidden:1,main:'str',outfit:'armor',base:{str:7,agi:3,int:4,vit:5,per:3},desc:'ผู้ที่ชำระล้างวิหารปีศาจจนได้รับการยอมรับจากนรก',
  trait:{n:'สายเลือดปีศาจ',fx:{atkp:25}},act:['hellfire','dominion','soulreap','apocalypse'],
  pas:[['k1','ออร่าข่มขวัญ',{enemyweak:15}],['k2','กลืนกินวิญญาณ',{ls:10,killmp:10}],['k3','เกราะนรก',{defp:20,thorns:10}],['k4','อำนาจเหนือชีวิต',{killheal:15}],['k5','บัลลังก์ปีศาจ',{gold:40,xp:15}]],
  cond:{f:S=>(S.cleared[4]||0)>=3,hint:'ผู้ที่ชำระล้างวิหารแห่งปีศาจถึงสามครา…'},
  art:[['cape','horns','crownh','greatsword'],{c:'#1b1b22',a:'#ff3b3b',d:'#0e0e12',am:'#2b2b33',n:'#2b2b2b',r:'#5a0000',y:'#ffcc33',e:'#ffdd33',x:'#2b2b2b',w:'#ff3b3b',g:'#ff3b3b'}],
  aw:{name:'จอมมารผู้ครองนรก',trait:{n:'ออร่าจอมมาร',fx:{enemyweak:20}},ult:{n:'นรกาภิวัฒน์',mp:35,fx:{m:6,pierce:1}},ov:['halo'],pal:{hy:'#ff3b3b',y:'#ff3b3b'},glow:'#ff3b3b'}},
 {id:'undying',name:'ผู้ไม่มีวันตาย',rar:'???',w:0,hidden:1,main:'vit',outfit:'robe',base:{str:4,agi:2,int:2,vit:8,per:3},desc:'ผู้ที่ล้มตายซ้ำแล้วซ้ำเล่าจนยมทูตยอมแพ้',
  trait:{n:'อมตะ',fx:{undying:1}},act:['lifeburst','reaper','deathaura','rebirth'],
  pas:[['u1','ร่างไม่เน่าเปื่อย',{regen:4,hpmax:10}],['u2','หนามกระดูก',{thorns:25}],['u3','วิญญาณดื้อดึง',{lowhpboost:30}],['u4','ดูดพลังชีวิต',{ls:10}],['u5','อึดเกินมนุษย์',{stam:25,stasave:10}]],
  cond:{f:S=>S.deaths>=5,hint:'ผู้ที่ปฏิเสธความตายมาแล้วห้าครั้ง…'},
  art:[['hood','scythe'],{o:'#3a4250',c:'#2e3440',a:'#5ff2ff',d:'#1e232c',e:'#5ff2ff',w:'#d8e0e8',k:'#2a2a2a'}],
  aw:{name:'ยมทูตผู้ไม่ดับสูญ',trait:{n:'คำสาปอมตะ',fx:{undying:1,lowhpboost:20}},ult:{n:'พิพากษาแห่งความตาย',mp:24,fx:{m:2,missing:1.5,pierce:1}},ov:['cape'],pal:{r:'#11151c'},glow:'#5ff2ff'}},
];
/* expansion classes (expansion.js) join the roster; each secondary class (subclass.js) brings one active skill */
Object.assign(ACT,XACT);CLASSES.push(...XCLASSES);
SUBCLASSES.forEach(s=>{ACT['sub_'+s.id]=s.act});
export const PAS={};
CLASSES.forEach(c=>{c.pasIds=c.pas.map(([id,n,fx])=>{PAS[id]={n,fx};return id});ACT['u_'+c.id]=c.aw.ult});

export const GATES=[
 {r:'E',lv:1,sta:10,name:'ถ้ำก๊อบลิน',mobs:['ก๊อบลิน','ก๊อบลินนักธนู','หมาป่าเขี้ยวเหล็ก'],boss:'หัวหน้าก๊อบลิน'},
 {r:'D',lv:6,sta:14,name:'เหมืองร้าง',mobs:['มดยักษ์','ตะขาบหิน','โครงกระดูกทหาร'],boss:'ราชินีมดหิน'},
 {r:'C',lv:13,sta:18,name:'ป่าเงาจันทร์',mobs:['หมาป่าเงา','ออร์คล่าสัตว์','ภูตไม้'],boss:'จ่าฝูงหมาป่าสีเลือด'},
 {r:'B',lv:21,sta:22,name:'ปราสาทน้ำแข็ง',mobs:['เอลฟ์น้ำแข็ง','โกเลมหิมะ','หมีขาวคลั่ง'],boss:'นักรบเอลฟ์น้ำแข็ง'},
 {r:'A',lv:31,sta:28,name:'วิหารปีศาจ',mobs:['อสูรเขาคู่','ปีศาจคลั่ง','อัศวินมืด'],boss:'ขุนนางปีศาจ'},
 {r:'S',lv:46,sta:34,name:'เกาะรังมด',mobs:['มดทหาร','มดพิษ','มดราชองครักษ์'],boss:'ราชามด'},
 {r:'X',lv:22,sta:30,name:'มิติแห่งการตื่นรู้',mobs:[],boss:'ผู้คุมบททดสอบ',trial:1},
 /* indexes are save keys (S.cleared, TRIAL, demonking's cond): only ever append */
 {r:'A',lv:38,sta:31,name:'หุบเขามังกรหลับ',mobs:['ลูกมังกรไฟ','อัศวินกระดูกมังกร','ไวเวิร์นพิษ'],boss:'มังกรเพลิงโบราณ'},
 {r:'T',lv:40,sta:20,name:'หอคอยไร้สิ้นสุด',mobs:[],boss:'',tower:1},
 {r:'R',lv:5,sta:12,name:'สนามสอบสมาคมฮันเตอร์',mobs:[],boss:'ผู้คุมสอบสมาคม',exam:1},
];
export const TRIAL=6,AWAKE_LV=20,ROOM_STA=3,FLEE_STA=5,TRAIN_STA=2;
export const AFX={
 none:{n:'เกตปกติ',d:'ไม่พบความผิดปกติ',w:35,c:''},
 blood:{n:'พระจันทร์สีเลือด',d:'มอนสเตอร์ ATK +25% · ทอง +50%',w:15,gold:1.5,atk:1.25,c:'bad'},
 mist:{n:'หมอกพิษ',d:'เสีย HP 3% ทุกเทิร์น · EXP +30%',w:13,xp:1.3,c:'warn'},
 mana:{n:'คลื่นมานา',d:'MP ฟื้นเร็วขึ้น 3 เท่า',w:13,c:'cy'},
 unstable:{n:'เกตไม่เสถียร',d:'มอนสเตอร์ HP +30% · EXP +50%',w:12,hp:1.3,xp:1.5,c:'vi'},
 blessed:{n:'พรแห่งเกต',d:'ฟื้น HP 10% ทุกครั้งที่ผ่านห้อง',w:12,c:'cy'},
};
export const WPN=[{n:'มือเปล่า',a:0},{n:'มีดสั้นเหล็ก',a:8,p:80},{n:'ดาบเหล็กกล้า',a:20,p:300},{n:'มีดเขี้ยวพิษ',a:45,p:900},{n:'ดาบมังกรดำ',a:90,p:2500},{n:'กริชราชันย์',a:160,p:6000}];
export const ARM=[{n:'เสื้อผ้าธรรมดา',d:0,h:0},{n:'เกราะหนัง',d:4,h:40,p:70},{n:'เกราะโซ่',d:10,h:100,p:260},{n:'เกราะอัศวิน',d:22,h:220,p:800},{n:'เกราะเกล็ดมังกร',d:40,h:450,p:2200},{n:'เสื้อคลุมราชันย์',d:70,h:800,p:5500}];
export const DAILY=[['push','วิดพื้น',100,'ครั้ง',20],['sit','ซิทอัพ',100,'ครั้ง',20],['squat','สควอท',100,'ครั้ง',20],['run','วิ่ง',10,'กม.',2]];
export const ACTIVITIES=[
 {id:'train2',n:'ฝึกพิเศษกับครูฝึกสมาคม',d:'แต้มสถานะ +1',cost:25,max:2},
 {id:'job',n:'รับงานคุ้มกันของสมาคม',d:'ได้ทองตามเลเวล',cost:20,max:3},
 {id:'nap',n:'งีบพักฟื้น',d:'สตามินา +20 ไม่เสียอะไร',cost:0,max:1},
];
export const SPOT_PER_DAY=2;

/* character creation */
export const HAIR=[{n:'สั้น',ov:[]},{n:'ยาว',ov:['hairlong']},{n:'ชี้ตั้ง',ov:['hairspiky']},{n:'หางม้า',ov:['hairpony']},{n:'ผมม้า',ov:['hairbangs']}];
export const HC=['#1b1b22','#5a3a22','#c9a46a','#d6d6e2','#b02a3a','#3b5bd6','#7b3fbf','#e86fa8'];
export const SKIN=['#f6d2b1','#f1c39a','#d9a074','#a8714a','#6e4a32'];
export const EYES=['#151515','#4a2e1a','#2b6ed6','#2f9e6a','#c0303f','#8a5ad6'];
export const ORIGINS=[
 {id:'student',n:'นักเรียนมัธยม',d:'เรียนรู้ไว EXP +10%',fx:{xp:10}},
 {id:'soldier',n:'ทหารผ่านศึก',d:'STR +2 และ VIT +2 ตั้งแต่เริ่ม',st:{str:2,vit:2}},
 {id:'athlete',n:'นักกีฬา',d:'สตามินาสูงสุด +25',fx:{stamflat:25}},
 {id:'office',n:'พนักงานออฟฟิศ',d:'เริ่มด้วยทอง +200 และได้ทอง +10%',fx:{gold:10},gold:200},
 {id:'medic',n:'นักศึกษาแพทย์',d:'ยาได้ผล +30% และเริ่มด้วยยา HP +2',fx:{potion:30},pot:2},
 {id:'weakest',n:'ฮันเตอร์ที่อ่อนแอที่สุด',d:'ค่าสถานะทุกอย่าง -1 แต่โอกาสได้อาชีพลับ ×3',st:{str:-1,agi:-1,int:-1,vit:-1,per:-1},hidden3:1},
];
export const ORIG=Object.fromEntries(ORIGINS.map(o=>[o.id,o]));
export const PLAIN={c:'#5b6b82',a:'#d6dde6',d:'#3e4a5c',p:'#2c3442',b:'#1e232c'};

/* ================= STAT GROWTH =================
   Any class grows through stats: each stat unlocks a perk at 20 / 40 / 70 total points,
   and a non-main stat at AFF_NEED or more opens a hybrid awakening path (e.g. ranger + INT → นักธนูเวท). */
export const PERK_TIERS=[20,40,70];
export const STAT_PERKS={
 str:[{n:'กำลังแขนเหล็ก',fx:{atkp:8}},{n:'หมัดทลายภูผา',fx:{critdmg:25,bossdmg:10}},{n:'แรงสะท้านพสุธา',fx:{extrahit:40}}],
 agi:[{n:'เท้าไว',fx:{dodge:4}},{n:'ฝีมือว่องไว',fx:{double:15}},{n:'เร็วเหนือเสียง',fx:{extraturn:8}}],
 int:[{n:'จิตตื่นรู้',fx:{skillamp:10}},{n:'วงจรมานา',fx:{manaflow:15,mpr:2}},{n:'ปราชญ์ผู้รอบรู้',fx:{skillamp:15,stunchance:8}}],
 vit:[{n:'ร่างแกร่ง',fx:{hpmax:8}},{n:'เลือดเนื้อเหล็กกล้า',fx:{regen:2,defp:8}},{n:'ไม่ล้มง่าย',fx:{undying:1}}],
 per:[{n:'ตาไว',fx:{crit:5}},{n:'อ่านจังหวะ',fx:{firststrike:1}},{n:'ญาณหยั่งรู้',fx:{counter:20,gold:15}}],
};
export const AFF_NEED=40;
export const AFFINITY={
 str:{suf:'คลั่ง',d:'สายพลัง ตีหนักและทุบบอส',glow:'#ff7a3d',trait:{n:'พละกำลังล้นเหลือ',fx:{atkp:20,bossdmg:15}},ult:{n:'ทุบพสุธาแยก',mp:22,fx:{m:4.2,stun:1,statb:'str'}},ov:['pauldron'],pal:{a:'#ff7a3d'}},
 agi:{suf:'วายุ',d:'สายความเร็ว หลบไวและตีรัว',glow:'#7dffb0',trait:{n:'ร่างสายลม',fx:{dodge:10,double:20}},ult:{n:'พายุพันคม',mp:20,fx:{m:.8,hits:6,statb:'agi'}},ov:['scarf'],pal:{}},
 int:{suf:'เวท',d:'สายเวท อาวุธอาบมนตร์ สกิลแรงขึ้น',glow:'#7aa8ff',trait:{n:'อาวุธอาบมนตร์',fx:{skillamp:25,mpr:3}},ult:{n:'ระเบิดมานาบรรลัย',mp:24,fx:{m:3.8,pierce:1,burn:2,statb:'int'}},ov:['runes'],pal:{g:'#7aa8ff'}},
 vit:{suf:'เหล็กกล้า',d:'สายทนทาน ถึกและฟื้นตัวเร็ว',glow:'#ffd34d',trait:{n:'ร่างทองคำ',fx:{hpmax:20,defp:15,regen:2}},ult:{n:'ป้อมปราการทมิฬ',mp:20,fx:{m:2.4,guard:2,heal:.3,statb:'vit'}},ov:['pauldron'],pal:{}},
 per:{suf:'เนตรทิพย์',d:'สายการรับรู้ เห็นจุดตายทุกจุด',glow:'#ff5ad1',trait:{n:'ดวงตาเห็นจุดตาย',fx:{crit:12,critdmg:30}},ult:{n:'เนตรพิฆาต',mp:20,fx:{m:3,crit:1,exec:1,statb:'per'}},ov:['eyemark'],pal:{}},
};
Object.entries(AFFINITY).forEach(([k,a])=>{ACT['a_'+k]=a.ult});
export const STAT_NAME=Object.fromEntries(STATS.map(([k,th,ab])=>[k,{th,ab}]));

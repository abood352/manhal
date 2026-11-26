import '@fontsource/readex-pro/400.css';
import '@fontsource/readex-pro/500.css';
import '@fontsource/readex-pro/600.css';
import '@fontsource/readex-pro/700.css';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Icon } from '../icons';
import { shortDate, todayIso, uid, usePersisted, useRoute, useTitle, useToast } from '../kit';
import { Bar, Link, s, Tag, Toast } from '../ui';
import m from './manhal.module.css';

/* ───────── المحتوى ───────── */
type Exercise =
  | { kind: 'choice'; prompt: string; code: string; options: string[]; answer: number; why: string }
  | { kind: 'fill'; prompt: string; before: string; after: string; accept: string[]; why: string };
interface Lesson {
  id: string;
  title: string;
  duration: number;
  slides: { at: number; title: string; body: string; code?: string }[];
  exercise: Exercise;
}
interface Unit {
  title: string;
  lessons: Lesson[];
}

const jsUnits: Unit[] = [
  {
    title: 'الوحدة 1 · المتغيرات والأنواع',
    lessons: [
      {
        id: 'l1',
        title: 'let و const',
        duration: 240,
        slides: [
          { at: 0, title: 'لماذا نحتاج المتغيرات؟', body: 'المتغير اسم نحفظ تحته قيمة لنستخدمها لاحقاً.' },
          { at: 60, title: 'const للقيم الثابتة', body: 'استخدم const افتراضياً: لا يمكن إعادة الإسناد إليه.', code: "const city = 'دمشق';" },
          { at: 130, title: 'let للقيم المتغيرة', body: 'عندما تتغير القيمة لاحقاً نستخدم let.', code: 'let count = 0;\ncount = count + 1;' },
          { at: 200, title: 'الخلاصة', body: 'ابدأ بـconst، وانتقل إلى let فقط عند الحاجة. تجنّب var.' },
        ],
        exercise: { kind: 'choice', prompt: 'ماذا يحدث عند تنفيذ هذا الكود؟', code: 'const x = 5;\nx = 6;\nconsole.log(x);', options: ['يطبع 6', 'يطبع 5', 'خطأ TypeError', 'يطبع undefined'], answer: 2, why: 'لا يمكن إعادة الإسناد إلى متغير const، فيرمي المحرك TypeError.' },
      },
      {
        id: 'l2',
        title: 'الأنواع الأساسية',
        duration: 300,
        slides: [
          { at: 0, title: 'سبعة أنواع أولية', body: 'string, number, boolean, null, undefined, bigint, symbol.' },
          { at: 90, title: 'typeof', body: 'يخبرك typeof بنوع القيمة.', code: "typeof 'مرحبا'  // 'string'\ntypeof 42       // 'number'" },
          { at: 190, title: 'مفاجأة null', body: "typeof null يعيد 'object' — خطأ تاريخي في اللغة بقي للتوافق." },
        ],
        exercise: { kind: 'fill', prompt: 'أكمل الكود ليطبع نوع المتغير age:', before: 'const age = 30;\nconsole.log(', after: ' age);', accept: ['typeof'], why: 'typeof معامل يسبق القيمة ويعيد نوعها كنص.' },
      },
    ],
  },
  {
    title: 'الوحدة 2 · الدوال',
    lessons: [
      {
        id: 'l3',
        title: 'تعريف الدوال',
        duration: 280,
        slides: [
          { at: 0, title: 'الدالة وصفة قابلة لإعادة الاستخدام', body: 'نكتب الخطوات مرة ونستدعيها متى شئنا.' },
          { at: 80, title: 'التصريح', body: '', code: 'function greet(name) {\n  return `أهلاً ${name}`;\n}' },
          { at: 170, title: 'الدوال السهمية', body: 'صيغة مختصرة شائعة في الكود الحديث.', code: 'const square = (n) => n * n;' },
        ],
        exercise: { kind: 'fill', prompt: 'أكمل الدالة لتعيد مجموع العددين:', before: 'const add = (a, b) => ', after: ';', accept: ['a+b', 'b+a'], why: 'الدالة السهمية بتعبير واحد تعيد قيمته مباشرة دون return.' },
      },
      {
        id: 'l4',
        title: 'النطاق والإغلاق',
        duration: 330,
        slides: [
          { at: 0, title: 'النطاق', body: 'المتغير المعرّف داخل كتلة لا يُرى خارجها.' },
          { at: 110, title: 'الإغلاق (Closure)', body: 'الدالة تتذكر المتغيرات المحيطة بها حتى بعد انتهاء تنفيذ الدالة الخارجية.', code: 'function counter() {\n  let n = 0;\n  return () => ++n;\n}' },
          { at: 240, title: 'استخدام عملي', body: 'الإغلاق أساس العدادات، الذاكرة المؤقتة، وكثير من أنماط React.' },
        ],
        exercise: { kind: 'choice', prompt: 'ماذا يطبع هذا الكود؟', code: 'function counter() {\n  let n = 0;\n  return () => ++n;\n}\nconst next = counter();\nnext(); next();\nconsole.log(next());', options: ['1', '2', '3', '0'], answer: 2, why: 'كل استدعاء يزيد n المحفوظ في الإغلاق: 1 ثم 2 ثم 3.' },
      },
    ],
  },
  {
    title: 'الوحدة 3 · المصفوفات',
    lessons: [
      {
        id: 'l5',
        title: 'map و filter',
        duration: 310,
        slides: [
          { at: 0, title: 'تحويل كل عنصر', body: 'map تعيد مصفوفة جديدة بنفس الطول.', code: '[1, 2, 3].map((n) => n * 2) // [2, 4, 6]' },
          { at: 120, title: 'تصفية العناصر', body: 'filter تبقي العناصر التي يعيد الشرط لها true.', code: '[1, 2, 3, 4].filter((n) => n % 2 === 0) // [2, 4]' },
          { at: 230, title: 'الربط بينهما', body: 'يمكن سلسلة الدوال: صفِّ ثم حوّل.' },
        ],
        exercise: { kind: 'fill', prompt: 'أكمل لتحصل على الأعداد الأكبر من 10 فقط:', before: 'const big = nums.', after: '((n) => n > 10);', accept: ['filter'], why: 'filter تبقي العناصر التي يتحقق فيها الشرط.' },
      },
    ],
  },
];
const lessons = jsUnits.flatMap((u) => u.lessons);

interface Course {
  id: string;
  title: string;
  topic: 'برمجة' | 'تصميم' | 'بيانات';
  level: 'مبتدئ' | 'متوسط';
  teacher: string;
  rating: number;
  students: number;
  hours: string;
  color: [string, string];
  glyph: string;
  about: string;
  outline: string[];
  live: boolean;
}
const catalog: Course[] = [
  { id: 'js', title: 'أساسيات JavaScript', topic: 'برمجة', level: 'مبتدئ', teacher: 'م. وسيم العطار', rating: 4.8, students: 12840, hours: '25 دقيقة', color: ['#ffc23d', '#ff6a2b'], glyph: 'JS', about: 'ابدأ البرمجة بلغة الويب الأولى: المتغيرات، الأنواع، الدوال والإغلاق، والمصفوفات. كل درس قصير يتبعه تمرين يُصحَّح فوراً، وتنتهي الدورة بشهادة قابلة للتحقق.', outline: jsUnits.map((u) => u.title), live: true },
  { id: 'figma', title: 'تصميم واجهات المستخدم بـFigma', topic: 'تصميم', level: 'مبتدئ', teacher: 'م. ريما النجار', rating: 4.9, students: 9310, hours: '6 ساعات', color: ['#a78bfa', '#5a3fd1'], glyph: 'UI', about: 'من الإطارات والتخطيط التلقائي إلى المكونات وأنظمة التصميم، مع مشروع تطبيق كامل بنهاية الدورة.', outline: ['أساسيات Figma', 'التخطيط التلقائي', 'المكونات والمتغيرات', 'مشروع: تطبيق حجوزات'], live: false },
  { id: 'python', title: 'Python لتحليل البيانات', topic: 'بيانات', level: 'متوسط', teacher: 'د. أنس الحموي', rating: 4.7, students: 7420, hours: '9 ساعات', color: ['#34d399', '#0f766e'], glyph: 'Py', about: 'Pandas وNumPy والرسوم البيانية، مع تحليل بيانات حقيقية من السوق المحلية خطوة بخطوة.', outline: ['أساسيات Python', 'Pandas', 'التنظيف والتحويل', 'التصوير البياني'], live: false },
  { id: 'react', title: 'React من الصفر', topic: 'برمجة', level: 'متوسط', teacher: 'م. وسيم العطار', rating: 4.8, students: 6150, hours: '11 ساعة', color: ['#7dd3fc', '#1d4ed8'], glyph: '⚛', about: 'المكونات والحالة والتأثيرات، ثم التوجيه وجلب البيانات وبناء تطبيق متكامل ونشره.', outline: ['المكونات وJSX', 'الحالة والأحداث', 'التأثيرات وجلب البيانات', 'مشروع: لوحة مهام'], live: false },
  { id: 'sql', title: 'قواعد البيانات وSQL', topic: 'بيانات', level: 'مبتدئ', teacher: 'د. لمى شيخ الأرض', rating: 4.6, students: 5020, hours: '5 ساعات', color: ['#fda4af', '#be123c'], glyph: 'SQL', about: 'تصميم الجداول والعلاقات، الاستعلامات والربط والتجميع، والفهارس.', outline: ['النموذج العلائقي', 'SELECT والتصفية', 'JOIN والتجميع', 'التصميم والتطبيع'], live: false },
  { id: 'git', title: 'Git وGitHub للمبتدئين', topic: 'برمجة', level: 'مبتدئ', teacher: 'م. كنان مرعي', rating: 4.7, students: 8800, hours: '3 ساعات', color: ['#fdba74', '#9a3412'], glyph: 'git', about: 'تتبّع التغييرات، الفروع والدمج، والعمل الجماعي عبر طلبات الدمج.', outline: ['المستودع والإيداع', 'الفروع', 'GitHub والتعاون', 'حل التعارضات'], live: false },
];

interface Progress {
  position: number;
  watched: boolean;
  passed: boolean;
}
interface Comment {
  id: string;
  lesson: string;
  author: string;
  text: string;
  at: string;
  teacher?: boolean;
}
const seedComments: Comment[] = [
  { id: 'c1', lesson: 'l1', author: 'مها', text: 'هل يمكن تعديل خصائص كائن معرّف بـconst؟', at: todayIso() },
  { id: 'c2', lesson: 'l1', author: 'م. وسيم العطار', text: 'نعم، const يمنع إعادة الإسناد فقط وليس تعديل محتوى الكائن.', at: todayIso(), teacher: true },
  { id: 'c3', lesson: 'l4', author: 'كريم', text: 'الإغلاق صار واضحاً بعد مثال العداد، شكراً!', at: todayIso() },
];

const pages = ['explore', 'course', 'learn', 'my', 'certificate'] as const;
type Page = (typeof pages)[number];
const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const normalize = (v: string) => v.replace(/\s+/g, '').replace(/;$/, '');
function certCode(name: string, date: string) {
  let h = 2166136261;
  for (const c of `${name}|${date}|manhal-js`) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return `MNH-${h.toString(36).toUpperCase().padStart(7, '0').slice(0, 7)}`;
}

export default function Manhal() {
  const { page, param, go, href } = useRoute('manhal', pages, 'explore');
  const [enrolled, setEnrolled] = usePersisted('manhal:enrolled', false);
  const [waitlist, setWaitlist] = usePersisted<string[]>('manhal:waitlist', []);
  const [progress, setProgress] = usePersisted<Record<string, Progress>>('manhal:progress', {});
  const [comments, setComments] = usePersisted('manhal:comments', seedComments);
  const [cert, setCert] = usePersisted<{ name: string; date: string } | null>('manhal:cert', null);
  const [streak, setStreak] = usePersisted('manhal:streak', { days: 4, last: '' });
  const [toast, show] = useToast();

  const p = (id: string): Progress => progress[id] ?? { position: 0, watched: false, passed: false };
  const done = (id: string) => p(id).watched && p(id).passed;
  const doneCount = lessons.filter((l) => done(l.id)).length;
  const pct = (doneCount / lessons.length) * 100;
  const update = (id: string, patch: Partial<Progress>) => setProgress((all) => ({ ...all, [id]: { ...(all[id] ?? { position: 0, watched: false, passed: false }), ...patch } }));
  const nextLesson = lessons.find((l) => !done(l.id)) ?? lessons[0];
  const course = catalog.find((c) => c.id === param);
  const lesson = lessons.find((l) => l.id === param) ?? nextLesson;
  useTitle(`${page === 'course' && course ? course.title : page === 'learn' ? lesson.title : page === 'my' ? 'تعلّمي' : page === 'certificate' ? 'الشهادات' : 'استكشف الدورات'} | منهل`);

  // لمسة واقعية: سلسلة الأيام المتتالية تزيد عند إكمال أول درس في اليوم
  const bumpStreak = () => {
    if (streak.last === todayIso()) return;
    setStreak({ days: streak.days + 1, last: todayIso() });
    show(`🔥 ${streak.days + 1} أيام متتالية! تابع هكذا`);
  };
  useEffect(() => {
    if (page === 'learn' && !enrolled) setEnrolled(true);
  }, [page, enrolled, setEnrolled]);

  const L = ({ to, p: prm, children, className, current, style }: { to: Page; p?: string; children: ReactNode; className?: string; current?: boolean; style?: CSSProperties }) => (
    <Link to={href(to, prm)} go={() => go(to, prm)} className={className} style={style} current={current ?? (page === to && (!prm || prm === param))}>
      {children}
    </Link>
  );

  return (
    <div className={m.theme}>
      <header className={m.nav}>
        <div className={m.navIn}>
          <L to="explore" className={m.logo} current={false}>
            <i>م</i> منهل
          </L>
          <nav className={m.links} aria-label="القائمة">
            <L to="explore" current={page === 'explore' || page === 'course'}>
              استكشف
            </L>
            <L to="my" current={page === 'my' || page === 'learn'}>
              تعلّمي
            </L>
            <L to="certificate">الشهادات</L>
          </nav>
          <div className={m.streak}>
            <span className={m.flame} title="أيام التعلّم المتتالية">
              🔥 <span className={s.num}>{streak.days}</span>
            </span>
            <span className={m.me}>م</span>
          </div>
        </div>
      </header>

      <main className={`${m.wrap} ${s.enter}`} key={page + param}>
        {page === 'explore' && (
          <Explore
            courseLink={(c, children) => (
              <L key={c.id} to="course" p={c.id} className={m.course} current={false} style={{ '--i': catalog.indexOf(c) } as CSSProperties}>
                {children}
              </L>
            )}
            onStart={() => (enrolled ? go('learn', nextLesson.id) : go('course', 'js'))}
            enrolled={enrolled}
          />
        )}

        {page === 'course' &&
          (course ? (
            <>
              <nav className={s.small} style={{ color: 'var(--text-muted)' }}>
                <L to="explore">الدورات</L> ‹ {course.topic} ‹ {course.title}
              </nav>
              <div className={m.landing}>
                <div className={s.stack} style={{ gap: 20 }}>
                  <div>
                    <Tag t="info">
                      {course.topic} · {course.level}
                    </Tag>
                    <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: 'var(--ink)', margin: '10px 0' }}>{course.title}</h1>
                    <p style={{ fontSize: '1.05rem' }}>{course.about}</p>
                    <p className={s.row} style={{ marginTop: 12, color: 'var(--text-muted)', gap: 16 }}>
                      <span className={m.stars}>★ {course.rating}</span>
                      <span className={s.num}>{course.students.toLocaleString('en-US')} متعلّم</span>
                      <span>{course.teacher}</span>
                    </p>
                  </div>
                  <div className={m.box}>
                    <h2>محتوى الدورة</h2>
                    {course.live
                      ? jsUnits.map((u) => (
                          <div key={u.title} style={{ marginBottom: 12 }}>
                            <b style={{ color: 'var(--ink)' }}>{u.title}</b>
                            <ul className={s.list}>
                              {u.lessons.map((l) => (
                                <li key={l.id}>
                                  <Icon name="play" size={14} style={{ color: 'var(--orange)' }} />
                                  <span className={s.grow}>{l.title}</span>
                                  <span className={`${s.num} ${s.small}`}>{mmss(l.duration)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))
                      : (
                          <ul className={s.list}>
                            {course.outline.map((o, i) => (
                              <li key={o}>
                                <span className={m.dot}>{i + 1}</span>
                                {o}
                                <Icon name="lock" size={14} style={{ marginInlineStart: 'auto', color: 'var(--text-muted)' }} />
                              </li>
                            ))}
                          </ul>
                        )}
                  </div>
                  <div className={m.box}>
                    <h2>ماذا ستتعلّم</h2>
                    <ul style={{ margin: 0, paddingInlineStart: '1.2em', lineHeight: 2 }}>
                      {course.outline.map((o) => (
                        <li key={o}>{o.replace(/^الوحدة \d · /, '')}</li>
                      ))}
                      <li>تمارين بعد كل درس وشهادة إتمام</li>
                    </ul>
                  </div>
                </div>
                <aside className={m.enroll}>
                  <div className={m.thumb} style={{ background: `linear-gradient(135deg, ${course.color[0]}, ${course.color[1]})`, height: 170 }}>
                    {course.glyph}
                  </div>
                  <div style={{ padding: 20 }} className={s.stack}>
                    <b style={{ fontSize: '1.5rem', color: 'var(--ink)' }}>مجانية</b>
                    {course.live ? (
                      <button
                        className={s.btnPrimary}
                        style={{ padding: '0.8rem' }}
                        onClick={() => {
                          if (!enrolled) {
                            setEnrolled(true);
                            show('سُجّلت في الدورة');
                          }
                          go('learn', nextLesson.id);
                        }}
                      >
                        {enrolled ? (doneCount ? 'تابع التعلّم' : 'ابدأ الدرس الأول') : 'سجّل وابدأ الآن'}
                      </button>
                    ) : waitlist.includes(course.id) ? (
                      <Tag t="ok">في قائمة الانتظار — سنُعلمك عند الإطلاق</Tag>
                    ) : (
                      <button className={s.btn} style={{ padding: '0.8rem' }} onClick={() => (setWaitlist([...waitlist, course.id]), show('أُضفت إلى قائمة الانتظار'))}>
                        تنطلق قريباً — أعلمني
                      </button>
                    )}
                    {enrolled && course.live && (
                      <>
                        <Bar value={pct} />
                        <span className={s.small}>
                          أنجزت {doneCount} من {lessons.length} دروس
                        </span>
                      </>
                    )}
                    <ul className={s.list} style={{ fontSize: '0.85rem' }}>
                      <li>
                        <Icon name="clock" size={16} /> {course.hours} من المحتوى
                      </li>
                      <li>
                        <Icon name="check" size={16} /> تمارين تُصحَّح فوراً
                      </li>
                      <li>
                        <Icon name="award" size={16} /> شهادة إتمام قابلة للتحقق
                      </li>
                    </ul>
                  </div>
                </aside>
              </div>
            </>
          ) : (
            <p className={s.empty}>لا توجد دورة بهذا الرابط.</p>
          ))}

        {page === 'learn' && (
          <div className={m.learn}>
            <div className={s.stack} style={{ gap: 20 }}>
              <div className={s.spread}>
                <div>
                  <span className={s.small} style={{ color: 'var(--text-muted)' }}>
                    {jsUnits.find((u) => u.lessons.includes(lesson))!.title}
                  </span>
                  <h1 style={{ fontSize: '1.5rem', color: 'var(--ink)', fontWeight: 700 }}>{lesson.title}</h1>
                </div>
                <div className={s.row}>
                  {(() => {
                    const i = lessons.indexOf(lesson);
                    return (
                      <>
                        {i > 0 && (
                          <L to="learn" p={lessons[i - 1].id} className={s.btn}>
                            → السابق
                          </L>
                        )}
                        {i < lessons.length - 1 && (
                          <L to="learn" p={lessons[i + 1].id} className={s.btnPrimary}>
                            التالي ←
                          </L>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              <Player
                key={lesson.id}
                lesson={lesson}
                start={p(lesson.id).position}
                onProgress={(position) => update(lesson.id, { position })}
                onWatched={() => {
                  if (p(lesson.id).watched) return;
                  update(lesson.id, { watched: true });
                  if (p(lesson.id).passed) bumpStreak();
                  else show('أنهيت المشاهدة — حلّ التمرين لإكمال الدرس');
                }}
              />
              <ExerciseCard
                key={`ex-${lesson.id}`}
                exercise={lesson.exercise}
                passed={p(lesson.id).passed}
                onPass={() => {
                  update(lesson.id, { passed: true });
                  if (p(lesson.id).watched) bumpStreak();
                  else show('إجابة صحيحة — أكمل المشاهدة لإنهاء الدرس');
                }}
              />
              <Discussion comments={comments.filter((c) => c.lesson === lesson.id)} onAdd={(text) => setComments((all) => [...all, { id: uid(), lesson: lesson.id, author: 'أنت', text, at: todayIso() }])} />
            </div>
            <aside className={m.curriculum}>
              <b style={{ color: 'var(--ink)' }}>أساسيات JavaScript</b>
              <div style={{ margin: '10px 0' }}>
                <Bar value={pct} />
                <span className={s.small} style={{ color: 'var(--text-muted)' }}>
                  {Math.round(pct)}% مكتمل
                </span>
              </div>
              {jsUnits.map((u) => (
                <div key={u.title}>
                  <p className={m.unit}>{u.title}</p>
                  {u.lessons.map((l) => (
                    <L key={l.id} to="learn" p={l.id} className={m.lesson} current={l.id === lesson.id}>
                      <span className={`${m.dot} ${done(l.id) ? m.dotDone : ''}`}>{done(l.id) ? '✓' : lessons.indexOf(l) + 1}</span>
                      <span className={s.grow}>{l.title}</span>
                      <span className={`${s.num} ${s.small}`}>{mmss(l.duration)}</span>
                    </L>
                  ))}
                </div>
              ))}
              {doneCount === lessons.length && (
                <L to="certificate" className={s.btnPrimary}>
                  <Icon name="award" size={16} /> احصل على شهادتك
                </L>
              )}
            </aside>
          </div>
        )}

        {page === 'my' && (
          <>
            <h1 className={m.h2} style={{ fontSize: '1.7rem' }}>
              تعلّمي
            </h1>
            <div className={s.grid}>
              <div className={m.box} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <Ring value={pct} />
                <div>
                  <b style={{ color: 'var(--ink)', fontSize: '1.1rem' }}>أساسيات JavaScript</b>
                  <p className={s.muted}>
                    {doneCount}/{lessons.length} دروس مكتملة
                  </p>
                  {enrolled ? (
                    <L to="learn" p={nextLesson.id} className={s.btnPrimary} current={false}>
                      {doneCount === lessons.length ? 'مراجعة' : `تابع: ${nextLesson.title}`}
                    </L>
                  ) : (
                    <L to="course" p="js" className={s.btnPrimary} current={false}>
                      سجّل في الدورة
                    </L>
                  )}
                </div>
              </div>
              <div className={m.box}>
                <h2>هذا الأسبوع</h2>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                  {['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'].map((d, i) => {
                    const active = i < Math.min(7, streak.days);
                    return (
                      <div key={d} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ height: 38, borderRadius: 12, background: active ? '#ffe066' : 'var(--bg-alt)', color: '#fff', display: 'grid', placeItems: 'center' }}>{active ? '🔥' : ''}</div>
                        <span className={s.small}>{d}</span>
                      </div>
                    );
                  })}
                </div>
                <p className={s.small} style={{ marginTop: 10, color: 'var(--text-muted)' }}>
                  أكمل درساً كل يوم لتحافظ على سلسلتك.
                </p>
              </div>
            </div>
            {waitlist.length > 0 && (
              <div className={m.box}>
                <h2>قائمة الانتظار</h2>
                <ul className={s.list}>
                  {waitlist.map((id) => {
                    const c = catalog.find((x) => x.id === id)!;
                    return (
                      <li key={id}>
                        <span className={s.grow}>
                          <L to="course" p={id} current={false}>
                            {c.title}
                          </L>
                        </span>
                        <Tag t="warn">تنطلق قريباً</Tag>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}

        {page === 'certificate' && <Certificate complete={doneCount === lessons.length} remaining={lessons.length - doneCount} cert={cert} onIssue={(name) => setCert({ name, date: todayIso() })} />}
      </main>
      <footer className={m.footer}>منهل — تعلّم البرمجة والتصميم بالعربية. نموذج تفاعلي ضمن معرض أعمال.</footer>
      <Toast toast={toast} />
    </div>
  );
}

function Explore({ courseLink, onStart, enrolled }: { courseLink: (c: Course, children: ReactNode) => ReactNode; onStart: () => void; enrolled: boolean }) {
  const [topic, setTopic] = useState<'الكل' | Course['topic']>('الكل');
  const [q, setQ] = useState('');
  const list = catalog.filter((c) => (topic === 'الكل' || c.topic === topic) && (!q || c.title.includes(q) || c.teacher.includes(q)));
  return (
    <>
      <section className={m.hero}>
        <div>
          <h1>
            تعلّم البرمجة <em className={m.mark}>بالعربية</em>،<br />
            درساً قصيراً كل يوم.
          </h1>
          <p>دروس لا تتجاوز ست دقائق، تمارين تُصحَّح فوراً، وشهادة تثبت ما تعلّمته.</p>
          <div className={s.row} style={{ marginTop: 22 }}>
            <button className={s.btnPrimary} style={{ padding: '0.8rem 1.6rem' }} onClick={onStart}>
              {enrolled ? 'تابع من حيث توقفت' : 'ابدأ مجاناً'}
            </button>
          </div>
        </div>
        <div className={m.blobs} aria-hidden="true">
          <div className={m.preview}>
            <div className={m.previewHead}>
              <span>الدرس 4 · النطاق والإغلاق</span>
              <span dir="ltr">3:12 / 5:30</span>
            </div>
            <pre className={m.code}>{'function counter() {\n  let n = 0;\n  return () => ++n;\n}'}</pre>
            <div className={m.previewQuiz}>
              <span>ماذا يطبع next() للمرة الثالثة؟</span>
              <b>3 ✓</b>
            </div>
          </div>
        </div>
      </section>
      <div className={s.spread} style={{ flexWrap: 'wrap', gap: 12 }}>
        <h2 className={m.h2}>كل الدورات</h2>
        <input className={s.input} style={{ maxWidth: 280, borderRadius: 999 }} placeholder="ابحث عن دورة أو مدرّس…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className={m.filters}>
        {(['الكل', 'برمجة', 'تصميم', 'بيانات'] as const).map((t) => (
          <button key={t} aria-pressed={topic === t} onClick={() => setTopic(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className={`${m.courses} ${s.stagger}`}>
        {list.map((c) =>
          courseLink(
            c,
            <>
              <div className={m.thumb} style={{ background: `linear-gradient(135deg, ${c.color[0]}, ${c.color[1]})` }}>
                <small>{c.live ? 'متاحة الآن' : 'قريباً'}</small>
                {c.glyph}
              </div>
              <div className={m.courseBody}>
                <h3>{c.title}</h3>
                <span className={s.small} style={{ color: 'var(--text-muted)' }}>
                  {c.teacher}
                </span>
                <div className={m.meta}>
                  <span className={m.stars}>★ {c.rating}</span>
                  <span className={s.num}>{c.students.toLocaleString('en-US')}</span>
                  <span>{c.level}</span>
                  <span>{c.hours}</span>
                </div>
              </div>
            </>,
          ),
        )}
        {list.length === 0 && <p className={s.empty}>لا دورات مطابقة.</p>}
      </div>
    </>
  );
}

function Ring({ value }: { value: number }) {
  const r = 50;
  const c = 2 * Math.PI * r;
  return (
    <svg className={m.progressRing} viewBox="0 0 120 120" role="img" aria-label={`${Math.round(value)}%`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--bg-alt)" strokeWidth="12" />
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--orange)" strokeWidth="12" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 60 60)" />
      <text x="60" y="68" textAnchor="middle" fontSize="24" fontWeight="700" fill="var(--ink)">
        {Math.round(value)}%
      </text>
    </svg>
  );
}

function Player({ lesson, start, onProgress, onWatched }: { lesson: Lesson; start: number; onProgress: (t: number) => void; onWatched: () => void }) {
  const [time, setTime] = useState(start >= lesson.duration ? 0 : start);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(4);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setTime((t) => Math.min(lesson.duration, t + speed / 4)), 250);
    return () => clearInterval(timer);
  }, [playing, speed, lesson.duration]);
  const sec = Math.floor(time);
  useEffect(() => {
    if (sec % 5 === 0 || sec >= lesson.duration) onProgress(sec);
    if (sec >= lesson.duration * 0.9) onWatched();
    if (sec >= lesson.duration) setPlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec]);
  const latest = useRef(time);
  latest.current = time;
  useEffect(() => () => onProgress(Math.floor(latest.current)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const slide = [...lesson.slides].reverse().find((x) => x.at <= time) ?? lesson.slides[0];
  return (
    <div className={m.player}>
      <div className={m.stage} onClick={() => setPlaying(!playing)}>
        <small style={{ color: '#ffe066' }} dir="ltr">
          {lesson.slides.indexOf(slide) + 1} / {lesson.slides.length}
        </small>
        <h3 style={{ fontSize: 'clamp(1.3rem, 3vw, 2rem)', fontWeight: 700 }}>{slide.title}</h3>
        {slide.body && <p style={{ opacity: 0.85, maxWidth: 560 }}>{slide.body}</p>}
        {slide.code && <pre className={m.code}>{slide.code}</pre>}
      </div>
      <div className={m.controls}>
        <button className={m.playBtn} onClick={() => setPlaying(!playing)} aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}>
          <Icon name={playing ? 'pause' : 'play'} />
        </button>
        <input type="range" min={0} max={lesson.duration} value={time} onChange={(e) => setTime(Number(e.target.value))} aria-label="موضع الدرس" style={{ flex: 1, accentColor: '#ffe066', direction: 'ltr' }} />
        <span className={`${s.num} ${s.small}`}>
          {mmss(time)} / {mmss(lesson.duration)}
        </span>
        <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="سرعة التشغيل" style={{ background: 'transparent', color: '#fff', border: '1px solid #ffffff44', borderRadius: 8, font: 'inherit', padding: '2px 4px' }}>
          <option value={4}>1×</option>
          <option value={8}>2×</option>
          <option value={40}>10×</option>
        </select>
      </div>
    </div>
  );
}

function ExerciseCard({ exercise, passed, onPass }: { exercise: Exercise; passed: boolean; onPass: () => void }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState<null | boolean>(passed ? true : null);
  const check = () => {
    const ok = exercise.kind === 'choice' ? choice === exercise.answer : exercise.accept.some((a) => normalize(a) === normalize(text));
    setResult(ok);
    if (ok && !passed) onPass();
  };
  return (
    <div className={m.box}>
      <h2 className={s.spread}>
        <span className={s.row}>
          <Icon name="doc" /> تمرين
        </span>
        {passed && <Tag t="ok">محلول</Tag>}
      </h2>
      <p style={{ marginBottom: 12 }}>{exercise.prompt}</p>
      {exercise.kind === 'choice' ? (
        <>
          <pre className={m.code}>{exercise.code}</pre>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginTop: 12 }}>
            {exercise.options.map((o, i) => (
              <button key={o} className={choice === i ? s.btnPrimary : s.btn} onClick={() => (setChoice(i), setResult(null))}>
                {o}
              </button>
            ))}
          </div>
        </>
      ) : (
        <pre className={m.code} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', whiteSpace: 'pre' }}>
          <span>{exercise.before}</span>
          <input
            aria-label="الجزء الناقص"
            value={text}
            onChange={(e) => (setText(e.target.value), setResult(null))}
            onKeyDown={(e) => e.key === 'Enter' && check()}
            style={{ width: 110, font: 'inherit', background: 'rgb(255 255 255 / .1)', color: 'inherit', border: '1px dashed #ffe066', borderRadius: 6, padding: '0 6px', margin: '0 4px' }}
          />
          <span>{exercise.after}</span>
        </pre>
      )}
      <div className={s.row} style={{ marginTop: 14 }}>
        <button className={s.btnPrimary} onClick={check} disabled={exercise.kind === 'choice' ? choice === null : !text.trim()}>
          تحقّق
        </button>
        {result === true && <Tag t="ok">صحيح ✓</Tag>}
        {result === false && <Tag t="bad">ليست الإجابة الصحيحة، حاول مجدداً</Tag>}
      </div>
      {result === true && (
        <p className={s.small} style={{ marginTop: 8, color: 'var(--text-muted)' }}>
          {exercise.why}
        </p>
      )}
    </div>
  );
}

function Discussion({ comments, onAdd }: { comments: Comment[]; onAdd: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div className={m.box}>
      <h2 className={s.row}>
        <Icon name="message" /> النقاش ({comments.length})
      </h2>
      <ul className={s.list}>
        {comments.map((c) => (
          <li key={c.id} style={{ alignItems: 'flex-start' }}>
            <span className={s.avatar} style={{ background: c.teacher ? 'var(--orange)' : 'var(--ink)' }}>
              {c.author[0]}
            </span>
            <div className={s.grow}>
              <b style={{ color: 'var(--ink)' }}>{c.author}</b> {c.teacher && <Tag t="info">المدرّس</Tag>}{' '}
              <span className={s.small} style={{ color: 'var(--text-muted)' }}>
                {shortDate(c.at)}
              </span>
              <p>{c.text}</p>
            </div>
          </li>
        ))}
        {comments.length === 0 && <li style={{ color: 'var(--text-muted)' }}>لا أسئلة بعد. كن أول من يسأل.</li>}
      </ul>
      <form
        className={s.row}
        style={{ marginTop: 10, flexWrap: 'nowrap' }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onAdd(text.trim());
          setText('');
        }}
      >
        <input className={s.input} style={{ borderRadius: 999 }} placeholder="اكتب سؤالك أو تعليقك…" value={text} onChange={(e) => setText(e.target.value)} />
        <button className={s.btnPrimary} disabled={!text.trim()}>
          نشر
        </button>
      </form>
    </div>
  );
}

function Certificate({ complete, remaining, cert, onIssue }: { complete: boolean; remaining: number; cert: { name: string; date: string } | null; onIssue: (name: string) => void }) {
  const [name, setName] = useState('');
  const [verify, setVerify] = useState('');
  const code = useMemo(() => (cert ? certCode(cert.name, cert.date) : ''), [cert]);
  const verified = verify.trim() ? verify.trim().toUpperCase() === code : null;
  return (
    <>
      <h1 className={m.h2} style={{ fontSize: '1.7rem' }}>
        الشهادات
      </h1>
      {!complete ? (
        <div className={m.box} style={{ textAlign: 'center' }}>
          <Icon name="award" size={44} style={{ color: 'var(--blue)', margin: '0 auto 8px', display: 'block' }} />
          <p>
            بقي {remaining} {remaining === 1 ? 'درس' : 'دروس'} لتحصل على شهادة «أساسيات JavaScript».
          </p>
        </div>
      ) : !cert ? (
        <form
          className={`${m.box} ${s.stack}`}
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim().length > 2) onIssue(name.trim());
          }}
        >
          <p>أكملت الدورة. اكتب اسمك كما تريده على الشهادة:</p>
          <input className={s.input} value={name} onChange={(e) => setName(e.target.value)} />
          <button className={s.btnPrimary} disabled={name.trim().length < 3}>
            إصدار الشهادة
          </button>
        </form>
      ) : (
        <div className={m.cert}>
          <span style={{ color: 'var(--orange)', fontWeight: 700, letterSpacing: 1 }}>منهل</span>
          <h3 style={{ fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', fontWeight: 700, color: 'var(--ink)' }}>شهادة إتمام</h3>
          <p>تشهد منصة منهل بأن</p>
          <strong style={{ fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', color: 'var(--orange)' }}>{cert.name}</strong>
          <p>
            أتمّ دورة «أساسيات JavaScript» بنجاح بتاريخ <span dir="ltr">{cert.date}</span>
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            رمز التحقق: <b dir="ltr">{code}</b>
          </p>
        </div>
      )}
      <div className={m.box}>
        <h2>التحقق من شهادة</h2>
        <input className={s.input} dir="ltr" placeholder="MNH-XXXXXXX" value={verify} onChange={(e) => setVerify(e.target.value)} />
        {verified === true && cert && (
          <p style={{ marginTop: 8 }}>
            <Tag t="ok">شهادة صالحة</Tag> باسم {cert.name} · {cert.date}
          </p>
        )}
        {verified === false && (
          <p style={{ marginTop: 8 }}>
            <Tag t="bad">لا توجد شهادة بهذا الرمز</Tag>
          </p>
        )}
      </div>
    </>
  );
}

'use client'

import React from 'react'
import { allTerms } from '@/data/terms'
import { termCategoryColor, type AITerm } from '@/data/types'

/**
 * Hand-built animated visuals for the term-match practice game.
 * Each visual is a small looping SVG scene (viewBox 120x90) that depicts the
 * concept without naming it. Only terms present in VISUALS are playable.
 *
 * All animations use the shared keyframes below (injected once by the game)
 * and CSS custom properties (--tx/--ty/--rot/--sc) so a handful of keyframes
 * can drive many different motions.
 */

export const TERM_VISUAL_KEYFRAMES = `
@keyframes tvPulse { 0%,100% { opacity: .25 } 50% { opacity: 1 } }
@keyframes tvBlink { 0%,44%,100% { opacity: 0 } 50%,90% { opacity: 1 } }
@keyframes tvPop { 0%,10% { opacity: 0; transform: scale(.4) } 22%,85% { opacity: 1; transform: scale(1) } 100% { opacity: 0; transform: scale(1) } }
@keyframes tvDrift { 0%,100% { transform: translate(0,0) } 50% { transform: translate(var(--tx,0px), var(--ty,0px)) } }
@keyframes tvSlide { 0%,12% { transform: translate(0,0) } 55%,88% { transform: translate(var(--tx,0px), var(--ty,0px)) } 100% { transform: translate(0,0) } }
@keyframes tvSpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
@keyframes tvSway { 0%,100% { transform: rotate(calc(var(--rot,8deg) * -1)) } 50% { transform: rotate(var(--rot,8deg)) } }
@keyframes tvGrow { 0%,15% { transform: scaleY(.12) } 60%,90% { transform: scaleY(1) } 100% { transform: scaleY(.12) } }
@keyframes tvScale { 0%,100% { transform: scale(1) } 50% { transform: scale(var(--sc,1.25)) } }
@keyframes tvDash { to { stroke-dashoffset: -24 } }
@keyframes tvDrop { 0%,20% { opacity: 0; transform: translateY(-8px) } 35%,70% { opacity: 1; transform: translateY(0) } 90%,100% { opacity: 0; transform: translateY(6px) } }
@keyframes tvFlash { 0%,60%,100% { opacity: 1 } 70%,90% { opacity: 0 } }
@keyframes tvShake { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-2px) } 40% { transform: translateX(2px) } 60% { transform: translateX(-2px) } 80% { transform: translateX(2px) } }
@keyframes tvTyping { 0% { width: 0 } 60%,100% { width: 34px } }
`

/** Shared inline-style helper: run a keyframe with fill-box transform origin. */
function anim(
  name: string,
  dur: number,
  delay = 0,
  vars: Record<string, string> = {},
): React.CSSProperties {
  return {
    animation: `${name} ${dur}s ease-in-out ${delay}s infinite`,
    transformBox: 'fill-box',
    transformOrigin: 'center',
    ...(vars as React.CSSProperties),
  }
}

const MUTED = '#3f3f46'
const DIM = '#26262b'
const TEXT = '#8a8990'
const GREEN = '#22c55e'
const RED = '#ef4444'

type VisualProps = { c: string }
type VisualFn = (p: VisualProps) => React.ReactElement

/* ---------------------------------------------------------------- visuals */

const TokenVisual: VisualFn = ({ c }) => (
  <g>
    {/* sentence bar that splits into chips */}
    <rect x="18" y="20" width="84" height="12" rx="3" fill="none" stroke={MUTED} strokeWidth="1.5" />
    <rect x="22" y="23" width="76" height="6" rx="2" fill={MUTED} opacity=".5" />
    {[0, 1, 2, 3].map((i) => (
      <g key={i} style={anim('tvDrop', 3, 0.25 * i)}>
        <rect x={18 + i * 22} y={52} width="18" height="13" rx="4" fill={c} opacity={i % 2 ? 0.45 : 0.9} />
      </g>
    ))}
    <path d="M60 36 L60 46" stroke={TEXT} strokeWidth="1.5" strokeDasharray="3 3" style={anim('tvDash', 1.2, 0, { animationTimingFunction: 'linear' })} />
  </g>
)

const TokenizerVisual: VisualFn = ({ c }) => (
  <g>
    {/* word slides into a machine, chips come out */}
    <rect x="44" y="30" width="32" height="30" rx="6" fill={DIM} stroke={c} strokeWidth="1.5" />
    <circle cx="60" cy="45" r="6" fill="none" stroke={c} strokeWidth="1.5" style={anim('tvSpin', 2.4, 0, { animationTimingFunction: 'linear' })} strokeDasharray="6 4" />
    <g style={anim('tvSlide', 3, 0, { '--tx': '26px' } as never)}>
      <rect x="6" y="39" width="30" height="12" rx="3" fill={MUTED} />
    </g>
    {[0, 1, 2].map((i) => (
      <g key={i} style={anim('tvPop', 3, 0.9 + 0.3 * i)}>
        <rect x={84} y={31 + i * 11} width="14" height="8" rx="3" fill={c} opacity={0.9 - i * 0.25} />
      </g>
    ))}
  </g>
)

const ContextWindowVisual: VisualFn = ({ c }) => (
  <g>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={i} x="16" y={16 + i * 11} width={i % 2 ? 74 : 88} height="5" rx="2.5" fill={MUTED} opacity=".55" />
    ))}
    <g style={anim('tvSlide', 3.4, 0, { '--ty': '33px' } as never)}>
      <rect x="12" y="12" width="96" height="24" rx="5" fill={c} opacity=".14" stroke={c} strokeWidth="1.5" />
    </g>
  </g>
)

const ParameterVisual: VisualFn = ({ c }) => (
  <g>
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const x = 26 + (i % 3) * 34
      const y = 26 + Math.floor(i / 3) * 34
      return (
        <g key={i}>
          <circle cx={x} cy={y} r="11" fill={DIM} stroke={MUTED} strokeWidth="1.5" />
          <g style={anim('tvSway', 2 + (i % 3) * 0.7, i * 0.2, { '--rot': `${30 + (i % 3) * 40}deg` } as never)}>
            <line x1={x} y1={y} x2={x} y2={y - 8} stroke={c} strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
      )
    })}
  </g>
)

const LLMVisual: VisualFn = ({ c }) => (
  <g>
    {/* stack of layers emitting a growing line of text */}
    {[0, 1, 2].map((i) => (
      <rect key={i} x={30 - i * 4} y={20 + i * 12} width={60 + i * 8} height="9" rx="4" fill={c} opacity={0.9 - i * 0.3} style={anim('tvPulse', 2.6, i * 0.35)} />
    ))}
    <rect x="30" y="62" width="60" height="12" rx="4" fill={DIM} stroke={MUTED} strokeWidth="1" />
    <rect x="34" y="66" height="4" rx="2" fill={TEXT} style={{ animation: 'tvTyping 2.6s ease-in-out infinite' }} width="34" />
  </g>
)

const PromptVisual: VisualFn = ({ c }) => (
  <g>
    <rect x="12" y="32" width="96" height="26" rx="13" fill={DIM} stroke={MUTED} strokeWidth="1.5" />
    <rect x="22" y="43" height="4" rx="2" fill={TEXT} style={{ animation: 'tvTyping 2.4s ease-in-out infinite' }} width="34" />
    <rect x="60" y="40" width="2" height="10" fill={c} style={anim('tvBlink', 1)} />
    <circle cx="94" cy="45" r="8" fill={c} style={anim('tvScale', 2.4, 0, { '--sc': '1.15' } as never)} />
    <path d="M91 45 L97 45 M94.5 42 L97 45 L94.5 48" stroke="#0a0a0a" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
)

const HallucinationVisual: VisualFn = ({ c }) => (
  <g>
    <path d="M20 22 h80 a6 6 0 0 1 6 6 v28 a6 6 0 0 1 -6 6 h-56 l-10 10 v-10 h-14 a6 6 0 0 1 -6 -6 v-28 a6 6 0 0 1 6 -6 z" fill={DIM} stroke={MUTED} strokeWidth="1.5" transform="translate(3 0)" />
    <rect x="30" y="32" width="52" height="4" rx="2" fill={TEXT} opacity=".7" />
    <rect x="30" y="41" width="38" height="4" rx="2" fill={TEXT} opacity=".45" />
    {/* confident check that flickers into a warning */}
    <g style={anim('tvFlash', 3)}>
      <circle cx="92" cy="40" r="9" fill={GREEN} opacity=".9" />
      <path d="M88 40 l3 3 l5 -6" stroke="#0a0a0a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g style={anim('tvBlink', 3, 0, {})}>
      <path d="M92 31 l9 16 h-18 z" fill={c} />
      <rect x="91" y="37" width="2" height="5" rx="1" fill="#0a0a0a" />
      <rect x="91" y="44" width="2" height="2" rx="1" fill="#0a0a0a" />
    </g>
  </g>
)

const TransformerVisual: VisualFn = ({ c }) => (
  <g>
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x="34" y={64 - i * 14} width="52" height="10" rx="3" fill="none" stroke={i === 3 ? c : MUTED} strokeWidth="1.5" />
    ))}
    <circle r="3" fill={c} style={anim('tvSlide', 2.2, 0, { '--ty': '-44px' } as never)} cx="60" cy="72" />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x="34" y={64 - i * 14} width="52" height="10" rx="3" fill={c} opacity=".12" style={anim('tvPulse', 2.2, 0.4 * i)} />
    ))}
  </g>
)

const AttentionVisual: VisualFn = ({ c }) => {
  const words = [22, 46, 70, 94]
  return (
    <g>
      {words.map((x, i) => (
        <rect key={i} x={x - 9} y="62" width="18" height="10" rx="3" fill={i === 2 ? c : MUTED} opacity={i === 2 ? 0.9 : 0.5} />
      ))}
      <rect x="51" y="16" width="18" height="10" rx="3" fill={c} style={anim('tvScale', 2.6, 0, { '--sc': '1.2' } as never)} />
      {words.map((x, i) => (
        <path
          key={i}
          d={`M60 28 Q ${(60 + x) / 2} ${44} ${x} 60`}
          fill="none"
          stroke={c}
          strokeWidth={i === 2 ? 2 : 1}
          opacity={i === 2 ? 0.9 : 0.25}
          style={i === 2 ? anim('tvPulse', 2.6, 0.3) : undefined}
        />
      ))}
    </g>
  )
}

const MoEVisual: VisualFn = ({ c }) => (
  <g>
    <circle cx="18" cy="45" r="6" fill={c} />
    <path d="M24 45 H 42" stroke={MUTED} strokeWidth="1.5" />
    <rect x="42" y="36" width="16" height="18" rx="4" fill={DIM} stroke={c} strokeWidth="1.5" />
    <path d="M47 45 h6 M50 42 v6" stroke={c} strokeWidth="1.3" />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <path d={`M58 45 C 70 45 70 ${16 + i * 19} 80 ${16 + i * 19}`} fill="none" stroke={MUTED} strokeWidth="1" opacity=".5" />
        <rect x="80" y={9 + i * 19} width="26" height="14" rx="4" fill={DIM} stroke={MUTED} strokeWidth="1.2" />
        <rect x="80" y={9 + i * 19} width="26" height="14" rx="4" fill={c} opacity=".55" style={anim('tvBlink', 4, i)} />
      </g>
    ))}
  </g>
)

const EmbeddingVisual: VisualFn = ({ c }) => (
  <g>
    <rect x="8" y="39" width="26" height="12" rx="3" fill={MUTED} opacity=".8" />
    <path d="M38 45 H 50" stroke={TEXT} strokeWidth="1.5" strokeDasharray="3 3" style={anim('tvDash', 1.4, 0, { animationTimingFunction: 'linear' })} />
    {/* vector cluster: near points glow with the accent */}
    {[
      [66, 30, 1], [76, 24, 1], [84, 34, 1],
      [98, 58, 0], [90, 70, 0], [104, 44, 0], [70, 62, 0],
    ].map(([x, y, hot], i) => (
      <circle key={i} cx={x} cy={y} r={hot ? 4 : 3} fill={hot ? c : MUTED} opacity={hot ? 0.95 : 0.5} style={hot ? anim('tvScale', 2.2, i * 0.25, { '--sc': '1.35' } as never) : anim('tvDrift', 3 + i * 0.3, i * 0.2, { '--tx': `${(i % 2 ? 3 : -3)}px`, '--ty': '2px' } as never)} />
    ))}
    <ellipse cx="75" cy="29" rx="17" ry="12" fill="none" stroke={c} strokeWidth="1" strokeDasharray="4 3" opacity=".6" />
  </g>
)

const MultimodalVisual: VisualFn = ({ c }) => (
  <g>
    {/* image / audio / text converge into one node */}
    <rect x="10" y="12" width="22" height="17" rx="3" fill="none" stroke={MUTED} strokeWidth="1.5" />
    <circle cx="17" cy="19" r="2.5" fill={MUTED} />
    <path d="M12 27 l6 -6 l5 5 l4 -4 l5 5" stroke={MUTED} strokeWidth="1.3" fill="none" />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={12 + i * 5} y={44 - (i % 2 ? 6 : 3)} width="2.6" height={i % 2 ? 12 : 7} rx="1.3" fill={MUTED} style={anim('tvGrow', 1.6, i * 0.18)} />
    ))}
    <g>
      <rect x="10" y="64" width="22" height="4" rx="2" fill={MUTED} />
      <rect x="10" y="72" width="15" height="4" rx="2" fill={MUTED} opacity=".6" />
    </g>
    {[20, 45, 70].map((y, i) => (
      <path key={i} d={`M36 ${y} C 62 ${y} 62 45 82 45`} fill="none" stroke={c} strokeWidth="1.3" opacity=".55" strokeDasharray="4 4" style={anim('tvDash', 1.6, i * 0.2, { animationTimingFunction: 'linear' })} />
    ))}
    <circle cx="94" cy="45" r="12" fill={c} opacity=".9" style={anim('tvScale', 2.6, 0, { '--sc': '1.12' } as never)} />
  </g>
)

const PreTrainingVisual: VisualFn = ({ c }) => (
  <g>
    {[0, 1, 2].map((i) => (
      <g key={i} style={anim('tvSlide', 2.7, i * 0.9, { '--tx': '40px' } as never)}>
        <rect x={4} y={18 + i * 20} width="18" height="22" rx="2.5" fill={DIM} stroke={MUTED} strokeWidth="1.2" />
        <rect x={8} y={24 + i * 20} width="10" height="2" rx="1" fill={TEXT} opacity=".7" />
        <rect x={8} y={29 + i * 20} width="7" height="2" rx="1" fill={TEXT} opacity=".45" />
      </g>
    ))}
    <path d="M74 45 m-16 0 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0" fill={DIM} stroke={c} strokeWidth="1.6" />
    <path d="M66 45 q4 -9 8 0 t8 0 M66 38 q8 -5 16 0 M66 52 q8 5 16 0" stroke={c} strokeWidth="1.2" fill="none" opacity=".8" />
    <circle cx="74" cy="45" r="19" fill={c} opacity=".1" style={anim('tvScale', 2.2, 0, { '--sc': '1.15' } as never)} />
  </g>
)

const FineTuningVisual: VisualFn = ({ c }) => (
  <g>
    <circle cx="60" cy="45" r="24" fill="none" stroke={MUTED} strokeWidth="1.5" />
    <circle cx="60" cy="45" r="15" fill="none" stroke={MUTED} strokeWidth="1.5" opacity=".8" />
    <circle cx="60" cy="45" r="7" fill="none" stroke={c} strokeWidth="1.5" />
    <circle cx="60" cy="45" r="2.6" fill={c} style={anim('tvScale', 2, 0, { '--sc': '1.5' } as never)} />
    <g style={anim('tvSlide', 2.8, 0, { '--tx': '-26px', '--ty': '20px' } as never)}>
      <path d="M86 19 l6 -6 M86 19 l8 -2 M86 19 l2 8" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="86" cy="19" r="3" fill={c} />
    </g>
  </g>
)

const RLHFVisual: VisualFn = ({ c }) => (
  <g>
    <rect x="12" y="18" width="42" height="22" rx="5" fill={DIM} stroke={GREEN} strokeWidth="1.4" />
    <rect x="18" y="25" width="30" height="3" rx="1.5" fill={TEXT} opacity=".7" />
    <rect x="18" y="31" width="22" height="3" rx="1.5" fill={TEXT} opacity=".45" />
    <rect x="66" y="18" width="42" height="22" rx="5" fill={DIM} stroke={MUTED} strokeWidth="1.4" />
    <rect x="72" y="25" width="30" height="3" rx="1.5" fill={TEXT} opacity=".4" />
    <rect x="72" y="31" width="22" height="3" rx="1.5" fill={TEXT} opacity=".3" />
    {/* thumbs-up stamps the preferred answer */}
    <g style={anim('tvPop', 3, 0.5)}>
      <circle cx="33" cy="52" r="9" fill={GREEN} />
      <path d="M29 53 v4 h2 v-4 z M31.5 53 l1.5 -4.5 q.6 -1.4 1.8 -.6 q1 .7 .5 2l-.8 2.4 h3 q1.6 0 1.3 1.6 l-.7 3 q-.3 1.3 -1.6 1.3 h-4.5" fill="#0a0a0a" transform="translate(0 -1.5)" />
    </g>
    <path d="M33 66 q27 14 54 -22" fill="none" stroke={c} strokeWidth="1.4" strokeDasharray="4 4" style={anim('tvDash', 1.6, 0, { animationTimingFunction: 'linear' })} opacity=".8" />
  </g>
)

const TemperatureVisual: VisualFn = ({ c }) => (
  <g>
    <rect x="20" y="14" width="8" height="48" rx="4" fill={DIM} stroke={MUTED} strokeWidth="1.4" />
    <circle cx="24" cy="68" r="8" fill={c} />
    <rect x="21.5" y="30" width="5" height="34" rx="2.5" fill={c} style={anim('tvGrow', 3, 0, { transformOrigin: 'bottom' })} />
    {/* chips scatter wider as heat rises */}
    {[0, 1, 2, 3, 4].map((i) => (
      <rect
        key={i}
        x={48 + (i % 3) * 22}
        y={22 + Math.floor(i / 3) * 26}
        width="16"
        height="10"
        rx="3"
        fill={c}
        opacity={0.85 - i * 0.12}
        style={anim('tvDrift', 2 + i * 0.35, i * 0.2, { '--tx': `${i % 2 ? 6 : -6}px`, '--ty': `${i % 2 ? -5 : 5}px` } as never)}
      />
    ))}
  </g>
)

const QuantizationVisual: VisualFn = ({ c }) => (
  <g>
    {[0, 1].map((r) =>
      [0, 1].map((col) => (
        <rect key={`${r}${col}`} x={12 + col * 20} y={22 + r * 20} width="16" height="16" rx="3" fill={c} opacity=".85" />
      )),
    )}
    <path d="M54 45 H 68 M64 41 l4 4 l-4 4" stroke={TEXT} strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <g style={anim('tvScale', 2.6, 0, { '--sc': '.8' } as never)}>
      {[0, 1].map((r) =>
        [0, 1].map((col) => (
          <rect key={`${r}${col}`} x={78 + col * 11} y={33 + r * 11} width="8" height="8" rx="2" fill={c} opacity=".55" />
        )),
      )}
    </g>
  </g>
)

const LatencyVisual: VisualFn = ({ c }) => (
  <g>
    <circle cx="38" cy="45" r="21" fill={DIM} stroke={MUTED} strokeWidth="1.5" />
    <line x1="38" y1="45" x2="38" y2="30" stroke={c} strokeWidth="2" strokeLinecap="round" style={anim('tvSpin', 2.8, 0, { transformOrigin: '38px 45px', animationTimingFunction: 'linear' })} />
    <circle cx="38" cy="45" r="2.4" fill={c} />
    <rect x="38" y="20" width="4" height="5" rx="1.5" fill={MUTED} transform="rotate(0 40 22)" />
    <g style={anim('tvPop', 2.8, 1.5)}>
      <path d="M70 34 h34 a5 5 0 0 1 5 5 v12 a5 5 0 0 1 -5 5 h-22 l-7 7 v-7 h-5 a5 5 0 0 1 -5 -5 v-12 a5 5 0 0 1 5 -5 z" fill={c} opacity=".22" stroke={c} strokeWidth="1.3" transform="translate(-4 0)" />
      <rect x="72" y="41" width="26" height="3.4" rx="1.7" fill={c} opacity=".9" />
    </g>
  </g>
)

const BenchmarkVisual: VisualFn = ({ c }) => (
  <g>
    <line x1="16" y1="72" x2="104" y2="72" stroke={MUTED} strokeWidth="1.5" />
    {[
      [26, 30, 0.45], [52, 44, 0.65], [78, 54, 1],
    ].map(([x, h, op], i) => (
      <rect key={i} x={x} y={72 - (h as number)} width="18" height={h} rx="3" fill={c} opacity={op as number} style={anim('tvGrow', 3, i * 0.25, { transformOrigin: 'bottom' })} />
    ))}
    <g style={anim('tvPop', 3, 1.4)}>
      <path d="M87 10 l2.6 5.3 5.9 .9 -4.3 4.1 1 5.9 -5.2 -2.8 -5.2 2.8 1 -5.9 -4.3 -4.1 5.9 -.9 z" fill="#eab308" />
    </g>
  </g>
)

const VRAMVisual: VisualFn = ({ c }) => (
  <g>
    <rect x="26" y="20" width="68" height="50" rx="6" fill={DIM} stroke={MUTED} strokeWidth="1.5" />
    <rect x="42" y="34" width="36" height="22" rx="3" fill="none" stroke={c} strokeWidth="1.5" />
    <circle cx="60" cy="45" r="5" fill="none" stroke={c} strokeWidth="1.3" style={anim('tvSpin', 3, 0, { animationTimingFunction: 'linear' })} strokeDasharray="5 3" />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={32 + i * 15} y="61" width="10" height="5" rx="1.5" fill={c} opacity=".25" style={anim('tvPulse', 2.4, i * 0.3)} />
    ))}
    {[0, 1, 2, 3, 4].map((i) => (
      <line key={i} x1={34 + i * 13} y1="20" x2={34 + i * 13} y2="14" stroke={MUTED} strokeWidth="2" />
    ))}
  </g>
)

const AlignmentVisual: VisualFn = ({ c }) => (
  <g>
    <path d="M14 30 C 50 30 70 30 106 30" stroke={MUTED} strokeWidth="1.5" strokeDasharray="5 4" />
    <path d="M14 62 C 50 62 70 62 106 62" stroke={MUTED} strokeWidth="1.5" strokeDasharray="5 4" />
    <path d="M14 46 C 44 46 50 40 70 44 S 100 46 106 46" stroke={c} strokeWidth="1.6" fill="none" opacity=".7" />
    <circle r="5" fill={c} style={anim('tvSlide', 3, 0, { '--tx': '80px' } as never)} cx="18" cy="45" />
    <circle cx="100" cy="46" r="8" fill="none" stroke={GREEN} strokeWidth="1.6" style={anim('tvPulse', 2, 0)} />
    <circle cx="100" cy="46" r="3" fill={GREEN} />
  </g>
)

const JailbreakVisual: VisualFn = ({ c }) => (
  <g>
    <rect x="42" y="40" width="36" height="28" rx="6" fill={DIM} stroke={c} strokeWidth="1.6" />
    <circle cx="60" cy="52" r="3.4" fill={c} />
    <rect x="58.5" y="54" width="3" height="7" rx="1.5" fill={c} />
    {/* shackle pops open */}
    <g style={anim('tvSway', 3, 0, { '--rot': '14deg', transformOrigin: '48px 40px' } as never)}>
      <path d="M48 40 v-8 a12 12 0 0 1 24 0 v8" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" />
    </g>
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M${84 + i * 6} ${30 - i * 5} l4 -4`} stroke="#eab308" strokeWidth="1.8" strokeLinecap="round" style={anim('tvBlink', 3, 0.4 + i * 0.15)} />
    ))}
  </g>
)

const PromptInjectionVisual: VisualFn = ({ c }) => (
  <g>
    <rect x="34" y="14" width="52" height="62" rx="4" fill={DIM} stroke={MUTED} strokeWidth="1.5" />
    {[0, 1, 2, 4, 5].map((i) => (
      <rect key={i} x="41" y={22 + i * 9} width={i % 2 ? 30 : 38} height="4" rx="2" fill={TEXT} opacity=".5" />
    ))}
    {/* a hidden red instruction slides into the document */}
    <g style={anim('tvSlide', 3, 0, { '--tx': '31px' } as never)}>
      <rect x="4" y="53" width="34" height="9" rx="2.5" fill={RED} opacity=".85" />
      <rect x="8" y="56" width="22" height="2.6" rx="1.3" fill="#0a0a0a" opacity=".7" />
    </g>
  </g>
)

const RAGVisual: VisualFn = ({ c }) => (
  <g>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={10 + i * 6} y={18 + i * 5} width="26" height="34" rx="3" fill={DIM} stroke={MUTED} strokeWidth="1.2" />
      </g>
    ))}
    <rect x="26" y="35" width="14" height="5" rx="2" fill={c} style={anim('tvPulse', 2.4, 0.4)} />
    <g style={anim('tvDrift', 2.6, 0, { '--tx': '4px', '--ty': '4px' } as never)}>
      <circle cx="42" cy="46" r="9" fill="none" stroke={c} strokeWidth="1.8" />
      <line x1="49" y1="53" x2="56" y2="60" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </g>
    <path d="M56 40 C 72 34 74 36 82 36" stroke={c} strokeWidth="1.3" strokeDasharray="4 4" fill="none" style={anim('tvDash', 1.6, 0, { animationTimingFunction: 'linear' })} />
    <path d="M78 24 h26 a5 5 0 0 1 5 5 v14 a5 5 0 0 1 -5 5 h-14 l-7 7 v-7 h-5 a5 5 0 0 1 -5 -5 v-14 a5 5 0 0 1 5 -5 z" fill={c} opacity=".18" stroke={c} strokeWidth="1.3" transform="translate(-6 6)" />
    <rect x="78" y="38" width="20" height="3.2" rx="1.6" fill={c} opacity=".9" style={anim('tvPop', 2.6, 1.2)} />
  </g>
)

const ToolUseVisual: VisualFn = ({ c }) => (
  <g>
    <circle cx="42" cy="45" r="15" fill={DIM} stroke={c} strokeWidth="1.5" />
    <g style={anim('tvSpin', 5, 0, { transformOrigin: '42px 45px', animationTimingFunction: 'linear' })}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <rect key={a} x="40" y="27" width="4" height="6" rx="1.2" fill={c} transform={`rotate(${a} 42 45)`} />
      ))}
    </g>
    <circle cx="42" cy="45" r="6" fill="#0f0f11" stroke={c} strokeWidth="1.4" />
    {/* wrench swings in to engage */}
    <g style={anim('tvSway', 2.6, 0, { '--rot': '12deg', transformOrigin: '92px 30px' } as never)}>
      <path d="M88 26 a8 8 0 1 0 8 8 l-4 -1 -8 14 -6 -3.5 8 -14 z" fill={MUTED} stroke={TEXT} strokeWidth="1" transform="rotate(30 88 34)" />
    </g>
  </g>
)

const ChainOfThoughtVisual: VisualFn = ({ c }) => (
  <g>
    {[0, 1, 2].map((i) => (
      <g key={i} style={anim('tvPop', 3.2, i * 0.5)}>
        <circle cx={26 + i * 24} cy={i % 2 ? 32 : 52} r="9" fill={DIM} stroke={c} strokeWidth="1.5" />
        <text x={26 + i * 24} y={(i % 2 ? 32 : 52) + 3} textAnchor="middle" fontSize="9" fill={c} fontWeight="700">{i + 1}</text>
      </g>
    ))}
    <path d="M34 48 L 43 37 M58 36 L 67 47" stroke={MUTED} strokeWidth="1.4" strokeDasharray="3 3" />
    <path d="M82 48 L 90 45" stroke={MUTED} strokeWidth="1.4" strokeDasharray="3 3" />
    <g style={anim('tvPop', 3.2, 1.8)}>
      <circle cx="100" cy="43" r="11" fill={GREEN} opacity=".9" />
      <path d="M95 43 l3.5 3.5 l6 -7" stroke="#0a0a0a" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </g>
)

const OpenWeightsVisual: VisualFn = ({ c }) => (
  <g>
    <rect x="38" y="34" width="44" height="32" rx="5" fill={DIM} stroke={c} strokeWidth="1.6" />
    <g style={anim('tvSway', 3.2, 0, { '--rot': '-24deg', transformOrigin: '38px 34px' } as never)}>
      <rect x="38" y="26" width="44" height="9" rx="3" fill={c} opacity=".85" />
    </g>
    {[0, 1, 2].map((i) => (
      <g key={i} style={anim('tvDrop', 2.7, i * 0.5)}>
        <path d={`M${48 + i * 12} 44 v10 M${44 + i * 12} 50 l4 5 l4 -5`} stroke="#f5f5f5" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ))}
  </g>
)

const AgentVisual: VisualFn = ({ c }) => (
  <g>
    {/* plan → act → observe loop */}
    <circle cx="60" cy="45" r="24" fill="none" stroke={MUTED} strokeWidth="1.4" strokeDasharray="4 4" style={anim('tvSpin', 8, 0, { transformOrigin: '60px 45px', animationTimingFunction: 'linear' })} />
    {[
      [60, 19, 'plan'], [83, 58, 'act'], [37, 58, 'see'],
    ].map(([x, y, label], i) => (
      <g key={i}>
        <circle cx={x as number} cy={y as number} r="10" fill={DIM} stroke={c} strokeWidth="1.4" style={anim('tvScale', 2.7, i * 0.9, { '--sc': '1.18' } as never)} />
        <text x={x as number} y={(y as number) + 2.6} textAnchor="middle" fontSize="6.4" fill={c} fontWeight="700">{label as string}</text>
      </g>
    ))}
    <path d="M72 24 l6 2 l-4 5" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </g>
)

const PromptCachingVisual: VisualFn = ({ c }) => (
  <g>
    {[0, 1, 2].map((i) => (
      <rect key={i} x="12" y={18 + i * 20} width="40" height="14" rx="4" fill={DIM} stroke={i === 0 ? c : MUTED} strokeWidth="1.3" opacity={1 - i * 0.18} />
    ))}
    {[0, 1, 2].map((i) => (
      <rect key={i} x="17" y={23 + i * 20} width="26" height="4" rx="2" fill={i === 0 ? c : TEXT} opacity=".6" />
    ))}
    <g style={anim('tvBlink', 2.2, 0.2)}>
      <path d="M74 22 l-8 16 h7 l-4 14 12 -18 h-7 l6 -12 z" fill="#eab308" />
    </g>
    <g style={anim('tvPop', 2.6, 0.9)}>
      <rect x="86" y="48" width="24" height="13" rx="6.5" fill={GREEN} opacity=".9" />
      <text x="98" y="57" textAnchor="middle" fontSize="7.4" fill="#0a0a0a" fontWeight="800">-90%</text>
    </g>
  </g>
)

const DistillationVisual: VisualFn = ({ c }) => (
  <g>
    {/* big model funnels drops into a small one */}
    <rect x="22" y="12" width="42" height="26" rx="6" fill={c} opacity=".85" />
    <text x="43" y="28" textAnchor="middle" fontSize="8" fill="#0a0a0a" fontWeight="800">1T</text>
    <path d="M32 40 L 43 52 L 54 40" fill="none" stroke={MUTED} strokeWidth="1.4" />
    {[0, 1].map((i) => (
      <circle key={i} r="2.6" fill={c} style={anim('tvDrop', 2.2, i * 1.1)} cx="43" cy="56" />
    ))}
    <rect x="32" y="64" width="22" height="15" rx="4" fill={DIM} stroke={c} strokeWidth="1.5" />
    <text x="43" y="74" textAnchor="middle" fontSize="6.6" fill={c} fontWeight="800">8B</text>
    <path d="M74 30 q14 0 14 15 t-14 15" fill="none" stroke={MUTED} strokeWidth="1.3" strokeDasharray="3 3" />
    <g style={anim('tvPulse', 2.4, 0.4)}>
      <text x="97" y="49" textAnchor="middle" fontSize="7" fill={TEXT}>≈ same</text>
      <text x="97" y="58" textAnchor="middle" fontSize="7" fill={TEXT}>skills</text>
    </g>
  </g>
)

const ThinkingModeVisual: VisualFn = ({ c }) => (
  <g>
    <circle cx="46" cy="40" r="15" fill={DIM} stroke={c} strokeWidth="1.5" />
    <path d="M40 40 q3 -6 6 0 t6 0" stroke={c} strokeWidth="1.3" fill="none" />
    <rect x="42" y="57" width="8" height="4" rx="2" fill={c} opacity=".7" />
    {/* orbiting thought dots, then the answer pops */}
    <g style={anim('tvSpin', 2.6, 0, { transformOrigin: '46px 40px', animationTimingFunction: 'linear' })}>
      <circle cx="46" cy="18" r="2.6" fill={c} />
      <circle cx="66" cy="52" r="2" fill={c} opacity=".7" />
      <circle cx="26" cy="52" r="1.6" fill={c} opacity=".5" />
    </g>
    <g style={anim('tvPop', 2.6, 1.3)}>
      <rect x="76" y="32" width="32" height="16" rx="8" fill={GREEN} opacity=".9" />
      <path d="M85 40 l4 4 l7 -8" stroke="#0a0a0a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </g>
)

const ContaminationVisual: VisualFn = ({ c }) => (
  <g>
    {/* training pile leaks onto the test sheet */}
    <rect x="12" y="14" width="38" height="28" rx="4" fill={DIM} stroke={MUTED} strokeWidth="1.4" />
    <text x="31" y="31" textAnchor="middle" fontSize="7" fill={TEXT} fontWeight="700">TRAIN</text>
    <rect x="70" y="42" width="38" height="34" rx="4" fill={DIM} stroke={c} strokeWidth="1.4" />
    <text x="89" y="55" textAnchor="middle" fontSize="7" fill={c} fontWeight="700">TEST</text>
    <rect x="77" y="61" width="24" height="3" rx="1.5" fill={TEXT} opacity=".5" />
    <rect x="77" y="67" width="17" height="3" rx="1.5" fill={TEXT} opacity=".35" />
    {[0, 1].map((i) => (
      <circle key={i} r="2.8" fill={RED} style={anim('tvDrop', 2.4, i * 1.2)} cx={54 + i * 6} cy="46" />
    ))}
    <path d="M50 30 C 62 32 62 38 66 42" stroke={RED} strokeWidth="1.4" strokeDasharray="3 3" fill="none" opacity=".8" />
  </g>
)

const MCPVisual: VisualFn = ({ c }) => (
  <g>
    <circle cx="24" cy="45" r="13" fill={DIM} stroke={c} strokeWidth="1.5" />
    <path d="M18 45 q3 -6 6 0 t6 0" stroke={c} strokeWidth="1.2" fill="none" />
    {/* plug slides into the socket */}
    <g style={anim('tvSlide', 2.8, 0, { '--tx': '10px' } as never)}>
      <rect x="42" y="39" width="12" height="12" rx="2.5" fill={c} opacity=".9" />
      <line x1="54" y1="42" x2="60" y2="42" stroke={c} strokeWidth="2.4" />
      <line x1="54" y1="48" x2="60" y2="48" stroke={c} strokeWidth="2.4" />
    </g>
    <rect x="72" y="35" width="10" height="20" rx="2.5" fill={DIM} stroke={MUTED} strokeWidth="1.4" />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <path d={`M82 45 C 90 45 90 ${25 + i * 20} 96 ${25 + i * 20}`} stroke={MUTED} strokeWidth="1.2" fill="none" />
        <rect x="96" y={19 + i * 20} width="14" height="12" rx="3" fill={DIM} stroke={c} strokeWidth="1.2" style={anim('tvPulse', 2.7, i * 0.4)} />
      </g>
    ))}
  </g>
)

const ComputerUseVisual: VisualFn = ({ c }) => (
  <g>
    <rect x="18" y="14" width="84" height="56" rx="5" fill={DIM} stroke={MUTED} strokeWidth="1.5" />
    <rect x="18" y="14" width="84" height="10" rx="5" fill={MUTED} opacity=".4" />
    <circle cx="25" cy="19" r="1.7" fill={RED} opacity=".8" />
    <circle cx="31" cy="19" r="1.7" fill="#eab308" opacity=".8" />
    <circle cx="37" cy="19" r="1.7" fill={GREEN} opacity=".8" />
    <rect x="28" y="34" width="30" height="5" rx="2.5" fill={TEXT} opacity=".4" />
    <rect x="28" y="44" width="22" height="5" rx="2.5" fill={TEXT} opacity=".3" />
    <rect x="66" y="50" width="26" height="12" rx="4" fill={c} opacity=".85" style={anim('tvFlash', 3)} />
    {/* cursor glides to the button and clicks */}
    <g style={anim('tvSlide', 3, 0, { '--tx': '34px', '--ty': '22px' } as never)}>
      <path d="M42 30 l0 12 l3.4 -3 l2.2 5 l2.6 -1.2 l-2.2 -4.8 l4.6 -.6 z" fill="#f5f5f5" stroke="#0a0a0a" strokeWidth=".8" />
    </g>
  </g>
)

const GuardrailsVisual: VisualFn = ({ c }) => (
  <g>
    <path d="M12 26 H 108" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M12 64 H 108" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
    {[0, 1, 2, 3].map((i) => (
      <line key={i} x1={20 + i * 26} y1="26" x2={20 + i * 26} y2="20" stroke={c} strokeWidth="2" />
    ))}
    {/* the request bounces off the rails but keeps moving forward */}
    <circle r="5" fill="#f5f5f5" style={{ ...anim('tvSlide', 3.2, 0, { '--tx': '72px' } as never) }} cx="20" cy="45" />
    <circle r="7" fill="none" stroke={MUTED} strokeWidth="1" style={{ ...anim('tvSlide', 3.2, 0, { '--tx': '72px' } as never) }} cx="20" cy="45" />
    <path d="M30 45 q12 -12 24 0 t24 0" stroke={MUTED} strokeWidth="1.2" strokeDasharray="3 3" fill="none" opacity=".6" />
  </g>
)

const SyntheticDataVisual: VisualFn = ({ c }) => (
  <g>
    {/* robot head stamping out copies of data sheets */}
    <rect x="14" y="20" width="30" height="24" rx="6" fill={DIM} stroke={c} strokeWidth="1.5" />
    <circle cx="24" cy="31" r="3" fill={c} style={anim('tvBlink', 2.2, 0)} />
    <circle cx="36" cy="31" r="3" fill={c} style={anim('tvBlink', 2.2, 0.15)} />
    <line x1="29" y1="14" x2="29" y2="20" stroke={c} strokeWidth="1.5" />
    <circle cx="29" cy="12" r="2" fill={c} />
    {[0, 1, 2].map((i) => (
      <g key={i} style={anim('tvPop', 3, 0.4 + i * 0.5)}>
        <rect x={56 + i * 18} y={30 + i * 8} width="15" height="20" rx="2.5" fill={DIM} stroke={MUTED} strokeWidth="1.2" />
        <rect x={59 + i * 18} y={35 + i * 8} width="9" height="2.2" rx="1" fill={c} opacity=".8" />
        <rect x={59 + i * 18} y={40 + i * 8} width="6" height="2.2" rx="1" fill={c} opacity=".5" />
      </g>
    ))}
  </g>
)

const ScalingLawsVisual: VisualFn = ({ c }) => (
  <g>
    <line x1="16" y1="74" x2="108" y2="74" stroke={MUTED} strokeWidth="1.4" />
    <line x1="16" y1="74" x2="16" y2="12" stroke={MUTED} strokeWidth="1.4" />
    <path d="M20 68 C 45 62 65 48 100 20" stroke={c} strokeWidth="1.8" fill="none" strokeDasharray="120" style={{ animation: 'tvDash 3s linear infinite', strokeDasharray: '6 5' }} />
    {[
      [30, 65, 2.4], [55, 54, 3.6], [78, 38, 5], [98, 22, 6.6],
    ].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill={c} opacity={0.4 + i * 0.18} style={anim('tvScale', 2.4, i * 0.3, { '--sc': '1.25' } as never)} />
    ))}
  </g>
)

const DeepfakeVisual: VisualFn = ({ c }) => (
  <g>
    {/* a face whose right half flickers into a wireframe copy */}
    <circle cx="60" cy="42" r="24" fill={DIM} stroke={MUTED} strokeWidth="1.5" />
    <path d="M60 18 a24 24 0 0 1 0 48" fill={c} opacity=".15" />
    <circle cx="51" cy="38" r="3" fill={TEXT} />
    <g style={anim('tvFlash', 2.6)}>
      <circle cx="69" cy="38" r="3" fill={TEXT} />
    </g>
    <g style={anim('tvBlink', 2.6)}>
      <circle cx="69" cy="38" r="3" fill="none" stroke={c} strokeWidth="1.2" />
      <path d="M62 22 l14 6 M62 30 l16 2 M62 46 l15 -1 M62 54 l13 -5" stroke={c} strokeWidth=".9" opacity=".8" />
    </g>
    <path d="M52 52 q8 5 16 0" stroke={TEXT} strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <path d="M60 18 v48" stroke={c} strokeWidth="1.2" strokeDasharray="3 3" opacity=".8" />
  </g>
)

const APIVisual: VisualFn = ({ c }) => (
  <g>
    <rect x="12" y="30" width="30" height="30" rx="5" fill={DIM} stroke={MUTED} strokeWidth="1.4" />
    <text x="27" y="49" textAnchor="middle" fontSize="8" fill={TEXT} fontWeight="700">APP</text>
    <rect x="78" y="30" width="30" height="30" rx="5" fill={DIM} stroke={c} strokeWidth="1.4" />
    <path d="M87 45 q3 -6 6 0 t6 0" stroke={c} strokeWidth="1.3" fill="none" />
    <path d="M46 39 H 74" stroke={c} strokeWidth="1.4" strokeDasharray="4 4" style={anim('tvDash', 1.2, 0, { animationTimingFunction: 'linear' })} />
    <path d="M74 51 H 46" stroke={TEXT} strokeWidth="1.4" strokeDasharray="4 4" style={anim('tvDash', 1.2, 0.5, { animationTimingFunction: 'linear', animationDirection: 'reverse' })} />
    <path d="M70 36 l4 3 l-4 3 M50 48 l-4 3 l4 3" stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
)

const FewShotVisual: VisualFn = ({ c }) => (
  <g>
    {[0, 1].map((i) => (
      <g key={i}>
        <rect x="14" y={16 + i * 18} width="42" height="12" rx="3" fill={DIM} stroke={MUTED} strokeWidth="1.2" />
        <rect x={18} y={20 + i * 18} width="16" height="4" rx="2" fill={TEXT} opacity=".5" />
        <path d={`M38 ${22 + i * 18} l3 3 l5 -6`} stroke={GREEN} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(8 0)" />
      </g>
    ))}
    <rect x="14" y="54" width="42" height="12" rx="3" fill={DIM} stroke={c} strokeWidth="1.4" />
    <rect x="18" y="58" width="16" height="4" rx="2" fill={TEXT} opacity=".5" />
    <text x="48" y="64" textAnchor="middle" fontSize="8" fill={c} fontWeight="800">?</text>
    <path d="M62 60 C 74 60 74 45 84 45" stroke={c} strokeWidth="1.3" strokeDasharray="4 4" fill="none" style={anim('tvDash', 1.6, 0, { animationTimingFunction: 'linear' })} />
    <g style={anim('tvPop', 2.8, 1)}>
      <circle cx="95" cy="45" r="10" fill={c} opacity=".9" />
      <path d="M90 45 l3.5 3.5 l6 -7" stroke="#0a0a0a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </g>
)

const StreamingVisual: VisualFn = ({ c }) => (
  <g>
    <path d="M14 22 h74 a6 6 0 0 1 6 6 v22 a6 6 0 0 1 -6 6 h-52 l-9 9 v-9 h-13 a6 6 0 0 1 -6 -6 v-22 a6 6 0 0 1 6 -6 z" fill={DIM} stroke={MUTED} strokeWidth="1.5" transform="translate(6 4)" />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={i} x={28 + (i % 3) * 22} y={36 + Math.floor(i / 3) * 10} width="18" height="5" rx="2.5" fill={c} opacity={0.9 - i * 0.1} style={anim('tvPop', 3, i * 0.4)} />
    ))}
  </g>
)

/* ------------------------------------------------------------ registry */

const VISUALS: Record<string, VisualFn> = {
  'term-1': TokenVisual,
  'term-2': TokenizerVisual,
  'term-3': ContextWindowVisual,
  'term-4': ParameterVisual,
  'term-5': LLMVisual,
  'term-6': PromptVisual,
  'term-7': HallucinationVisual,
  'term-8': TransformerVisual,
  'term-9': AttentionVisual,
  'term-10': MoEVisual,
  'term-12': EmbeddingVisual,
  'term-13': MultimodalVisual,
  'term-14': PreTrainingVisual,
  'term-15': FineTuningVisual,
  'term-16': RLHFVisual,
  'term-21': TemperatureVisual,
  'term-23': StreamingVisual,
  'term-24': QuantizationVisual,
  'term-25': LatencyVisual,
  'term-26': BenchmarkVisual,
  'term-27': VRAMVisual,
  'term-30': AlignmentVisual,
  'term-31': JailbreakVisual,
  'term-32': PromptInjectionVisual,
  'term-35': APIVisual,
  'term-37': RAGVisual,
  'term-38': ToolUseVisual,
  'term-39': FewShotVisual,
  'term-40': ChainOfThoughtVisual,
  'term-41': OpenWeightsVisual,
  'term-44': AgentVisual,
  'term-prompt-caching': PromptCachingVisual,
  'term-distillation': DistillationVisual,
  'term-thinking-mode': ThinkingModeVisual,
  'term-contamination': ContaminationVisual,
  'term-mcp': MCPVisual,
  'term-computer-use': ComputerUseVisual,
  'term-guardrails': GuardrailsVisual,
  'term-synthetic-data': SyntheticDataVisual,
  'term-scaling-laws': ScalingLawsVisual,
  'term-deepfake': DeepfakeVisual,
}

/** Term ids that have a visual and can appear in the practice game. */
export const PLAYABLE_TERM_IDS: string[] = Object.keys(VISUALS)

const TERM_BY_ID = new Map(allTerms.map((t) => [t.id, t]))

export function getPlayableTerm(id: string): AITerm | undefined {
  return TERM_BY_ID.get(id)
}

interface TermVisualProps {
  termId: string
  /** When false, animations pause (e.g. cards hidden behind others). */
  className?: string
}

/** Renders the animated visual scene for a term inside a responsive SVG. */
export default function TermVisual({ termId, className }: TermVisualProps) {
  const V = VISUALS[termId]
  const term = TERM_BY_ID.get(termId)
  if (!V || !term) return null
  const c = termCategoryColor[term.category]
  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden="true" role="img">
      <V c={c} />
    </svg>
  )
}

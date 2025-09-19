'use client'

import { useState, useMemo } from 'react'
import { RRule, RRuleSet, rrulestr } from 'rrule'
import { format } from 'date-fns'

export default function RecurrenceEditor({
  value,
  onChange,
}: {
  value?: string | null
  onChange: (rrule: string | null) => void
}) {
  const [freq, setFreq] = useState<string>('WEEKLY')
  const [interval, setInterval] = useState<number>(1)
  const [byweekday, setByweekday] = useState<string[]>([])

  const preview = useMemo(() => {
    try {
      if (!value) return []
      const rule = rrulestr(value) as RRule
      return rule.all().slice(0, 12)
    } catch (e) {
      return []
    }
  }, [value])

  const buildRRule = () => {
    const rule = new RRule({
      freq: RRule.WEEKLY,
      interval,
      byweekday: byweekday.map((d) => (RRule as any)[d]),
      dtstart: new Date(),
    })
    return rule.toString()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm">Every</label>
        <input type="number" min={1} value={interval} onChange={(e) => setInterval(parseInt(e.target.value) || 1)} className="w-20 input" />
        <label className="text-sm">week(s) on</label>
        <div className="flex gap-1">
          {['MO','TU','WE','TH','FR','SA','SU'].map((d) => (
            <button key={d} type="button" onClick={() => setByweekday(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])} className={`px-2 py-1 border rounded ${byweekday.includes(d) ? 'bg-coral-600 text-white' : ''}`}>
              {d}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <button onClick={() => onChange(buildRRule())} className="btn">Apply</button>
          <button onClick={() => onChange(null)} className="btn ml-2">Clear</button>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <div>Next occurrences:</div>
          <ul className="list-disc ml-6">
            {preview.map((d, i) => (
              <li key={i}>{format(d, 'yyyy-MM-dd')}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}





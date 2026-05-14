"use client"

import { useState } from "react"
import Image from "next/image"

interface ElementsWheelProps {
  onElementClick?: (element: string) => void
  activeElement?: string | null
}

const elements = [
  { name: "Emergency Builder", color: "#2563eb" },
  { name: "Revenue Replacer", color: "#7c3aed" },
  { name: "Asset Builder", color: "#991b1b" },
  { name: "Tax Planner", color: "#1d4ed8" },
  { name: "Income Optimization", color: "#16a34a" },
  { name: "Legacy Enhancer", color: "#0d9488" },
  { name: "Legacy Defender", color: "#0891b2" },
  { name: "Dynasty Creator", color: "#ca8a04" },
]

export function ElementsWheel({ onElementClick, activeElement }: ElementsWheelProps) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null)
  const currentActive = activeElement || hoveredElement

  return (
    <div className="flex flex-col items-center">
      {/* Logo Image */}
      <div className="relative w-[300px] h-[380px]">
        <Image
          src="/images/8-elements-logo.png"
          alt="Eight Elements of Financial Control"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Legend */}
      <div className="mt-6">
        <h3 className="text-center text-sm font-medium text-foreground mb-4 tracking-wide">
          Eight Elements of Financial Control
        </h3>
        <div className="grid grid-cols-2 gap-x-12 gap-y-2.5">
          {elements.map((el) => (
            <button 
              key={el.name} 
              className={`flex items-center gap-2.5 text-left transition-all duration-200 group ${
                currentActive === el.name ? 'scale-105' : 'hover:scale-102'
              }`}
              onMouseEnter={() => setHoveredElement(el.name)}
              onMouseLeave={() => setHoveredElement(null)}
              onClick={() => onElementClick?.(el.name)}
            >
              <div 
                className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200 ${
                  currentActive === el.name ? 'scale-125' : 'group-hover:scale-110'
                }`}
                style={{ 
                  backgroundColor: el.color,
                  boxShadow: currentActive === el.name
                    ? `0 0 8px ${el.color}` 
                    : `0 1px 2px rgba(0,0,0,0.1)`
                }}
              />
              <span className={`text-xs transition-colors duration-200 ${
                currentActive === el.name
                  ? 'text-foreground font-medium' 
                  : 'text-muted-foreground group-hover:text-foreground'
              }`}>
                {el.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

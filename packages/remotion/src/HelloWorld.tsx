import React from 'react'
import { useCurrentFrame, interpolate, useVideoConfig } from 'remotion'

type HelloWorldProps = {
  text?: string
}

export const HelloWorld: React.FC<HelloWorldProps> = ({ text = 'World' }) => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  })

  const scale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: '#000',
            margin: 0,
          }}
        >
          Hello {text}!
        </h1>
        <p style={{ fontSize: 24, color: '#666', marginTop: 20 }}>
          Frame: {frame} / {durationInFrames} ({fps} fps)
        </p>
      </div>
    </div>
  )
}


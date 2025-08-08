'use client'

import { useEffect, useRef, useState } from 'react'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function DynamicInteractionDemo() {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isModalHiding, setIsModalHiding] = useState(false)
  const [isAudioActivated, setIsAudioActivated] = useState(false)
  const [showAudioButton, setShowAudioButton] = useState(true)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isCursorStuck, setIsCursorStuck] = useState(false)
  const stuckPositionRef = useRef({ x: 0, y: 0 })

  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const frogSoundRef = useRef<any>(null)
  const ToneRef = useRef<any>(null)
  const lastSoundTimeRef = useRef<number>(0)
  const soundCooldownMs = 100 // Minimum time between sounds in milliseconds

  // Initialize Tone.js
  useEffect(() => {
    const initializeTone = async () => {
      if (typeof window !== 'undefined') {
        const Tone = (await import('tone')).default
        ToneRef.current = Tone

        // Replace the frogSoundRef initialization in the initializeTone function
        frogSoundRef.current = new Tone.Oscillator({
          frequency: 800, // High frequency for buzzer effect
          type: 'square' // Square wave creates harsh buzzer sound
        }).connect(
          new Tone.Gain(0.3).connect( // Lower volume to prevent ear damage
            new Tone.Filter({
              frequency: 1200,
              type: 'lowpass'
            }).toDestination()
          )
        )
      }
    }

    initializeTone()
  }, [])

  const playBuzzerSound = () => {
    const now = Date.now()

    // Check if enough time has passed since the last sound
    if (now - lastSoundTimeRef.current < soundCooldownMs) {
      return // Skip playing sound if it's too soon
    }

    if (ToneRef.current && frogSoundRef.current && ToneRef.current.context.state === 'running') {
      try {
        // Update the last sound time before triggering
        lastSoundTimeRef.current = now

        // Use Tone.js scheduling to ensure proper timing
        const triggerTime = ToneRef.current.now() + 0.01
        
        // Start the buzzer
        frogSoundRef.current.start(triggerTime)
        
        // Stop the buzzer after a short duration (200ms)
        frogSoundRef.current.stop(triggerTime + 0.2)
      } catch (error) {
        console.warn('Audio playback error:', error)
      }
    }
  }

  const showFreezeAndAlert = (event: MouseEvent) => {
    // Play the buzzer sound every time the mouse moves
    playBuzzerSound()

    // If cursor isn't stuck yet, make it stuck at current position
    if (!isCursorStuck) {
      const rect = document.body.getBoundingClientRect()
      stuckPositionRef.current = {
        x: event.clientX,
        y: event.clientY
      }
      setIsCursorStuck(true)
      
      // Force cursor back to stuck position
      setCursorPosition({ x: event.clientX, y: event.clientY })
    }

    // Clear any existing timeout to ensure the flash duration resets with each new movement
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current)
    }

    // Reset modal animation state
    setIsModalHiding(false)

    // Show overlay and modal
    setIsOverlayVisible(true)
    setIsModalVisible(true)

    // Set a new timeout to hide them after 500ms
    flashTimeoutRef.current = setTimeout(() => {
      setIsOverlayVisible(false)
      setIsModalHiding(true)

      // Remove modal visibility after animation completes
      setTimeout(() => {
        setIsModalVisible(false)
        setIsModalHiding(false)
      }, 150)
    }, 500)
  }

  const handleActivateAudio = async () => {
    if (ToneRef.current && ToneRef.current.context.state !== 'running') {
      await ToneRef.current.start()
      console.log('Audio context resumed!')
    }
    setIsAudioActivated(true)
    setShowAudioButton(false)
  }

  const handleModalClose = () => {
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current)
    }

    setIsOverlayVisible(false)
    setIsModalHiding(true)
    
    // Release the cursor when modal is closed
    setIsCursorStuck(false)

    setTimeout(() => {
      setIsModalVisible(false)
      setIsModalHiding(false)
    }, 150)
  }

  // Add mousemove event listener and cursor control
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // If cursor is stuck, prevent it from moving by resetting position
      if (isCursorStuck) {
        // Force cursor back to stuck position using CSS
        document.body.style.cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='12' fill='%23ff0000' stroke='%23ffffff' strokeWidth='2'/%3E%3Ctext x='16' y='20' textAnchor='middle' fill='white' fontSize='16'%3E🔒%3C/text%3E%3C/svg%3E"), auto`
        
        // Try to move cursor back (this won't work in browsers for security reasons, but we'll show visual feedback)
        setCursorPosition(stuckPositionRef.current)
      }
      
      showFreezeAndAlert(event)
    }

    document.body.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.body.removeEventListener('mousemove', handleMouseMove)
      document.body.style.cursor = 'auto' // Reset cursor
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current)
      }
    }
  }, [isCursorStuck])

  // Handle cursor stuck visual feedback
  useEffect(() => {
    if (isCursorStuck) {
      document.body.style.cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23ff4444' stroke='%23ffffff' strokeWidth='2'/%3E%3Ctext x='12' y='16' textAnchor='middle' fill='white' fontSize='12'%3E🔒%3C/text%3E%3C/svg%3E"), auto`
    } else {
      document.body.style.cursor = 'auto'
    }

    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [isCursorStuck])

  return (
    <div className={`${inter.className} bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200 min-h-screen flex items-center justify-center p-6`}>
      {/* Main Content Area */}
      <div className="relative z-20 max-w-2xl w-full bg-white p-10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out hover:shadow-3xl">
        <h1 className="text-5xl font-extrabold text-indigo-700 mb-6 text-center leading-tight">
          Explore the Dynamic Canvas
        </h1>
        <p className="text-gray-700 text-xl leading-relaxed mb-6 text-center">
          This page is crafted to demonstrate a unique, responsive interaction. Just move your cursor to experience it!
        </p>
        <p className="text-gray-600 text-lg leading-relaxed mb-8 text-center">
          Every slight movement will trigger a surprising visual cue, showcasing immediate feedback.
        </p>

        {/* Interactive elements */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-8">
          {showAudioButton && (
            <button
              onClick={handleActivateAudio}
              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              Activate Audio
            </button>
          )}
          <a
            href="#"
            className="text-indigo-600 hover:text-indigo-800 font-semibold text-lg py-4 px-8 transition duration-300 ease-in-out hover:underline"
          >
            Read the Guide
          </a>
        </div>

        <div className="mt-10 text-center">
          <input
            type="text"
            placeholder="Type something engaging..."
            className="w-full sm:w-3/4 px-6 py-4 border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-transparent transition duration-300 ease-in-out text-lg text-gray-800 placeholder-gray-400"
          />
        </div>

        <p className="text-gray-500 text-sm mt-10 text-center">
          *This demonstration highlights immediate visual responses to user input, specifically with every cursor movement.
        </p>
      </div>

      {/* Overlay for "Freezing" Effect */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 z-[999] transition-opacity duration-100 ease-in-out ${
          isOverlayVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Custom Alert Modal */}
      {isModalVisible && (
        <div
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-white to-gray-50 p-10 rounded-3xl shadow-2xl z-[1000] text-center transition-all duration-150 ease-in-out ${
            isModalHiding
              ? 'opacity-0 -translate-y-3 pointer-events-none'
              : 'opacity-100 translate-y-0 pointer-events-auto animate-in fade-in slide-in-from-top-3'
          }`}
        >
          <div className="text-6xl mb-4 animate-bounce">
            <span role="img" aria-label="Warning Icon">🚨</span>
          </div>
          <h2 className="text-4xl font-extrabold text-indigo-700 mb-3">Movement Detected!</h2>
          <p className="text-gray-700 text-xl mb-6">{'Oops! Your cursor moved again.'}</p>
          <button
            onClick={handleModalClose}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 px-7 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            Acknowledge
          </button>
        </div>
      )}
    </div>
  )
}

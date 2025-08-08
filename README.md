
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Interaction Demo</title>
    <!-- Load Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Load Inter font from Google Fonts for a modern, clean look -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Load Tone.js library for programmatic audio generation -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js"></script>
    <style>
        /* Apply Inter font and smooth scroll behavior */
        body {
            font-family: 'Inter', sans-serif;
            scroll-behavior: smooth;
            overflow: hidden; /* Prevent scrolling if the overlay is active */
        }
        /* Keyframe animation for a subtle fade-in effect on the modal */
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -60%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
        }
        /* Keyframe animation for a subtle fade-out effect on the modal */
        @keyframes fadeOut {
            from { opacity: 1; transform: translate(-50%, -50%); }
            to { opacity: 0; transform: translate(-50%, -60%); }
        }
        /* Styles for the full-screen overlay that simulates freezing */
        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6); /* Slightly darker for more impact */
            z-index: 999;
            opacity: 0; /* Start hidden */
            pointer-events: none; /* Make it not block events when hidden */
            transition: opacity 0.1s ease-in-out; /* Smooth transition */
        }
        .overlay.visible {
            opacity: 1; /* Fully opaque when visible */
            pointer-events: auto; /* Block events when visible */
        }
        /* Styles for the custom alert modal */
        .modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ffffff, #f0f4f8); /* Subtle gradient background */
            padding: 2.5rem; /* More padding */
            border-radius: 1.25rem; /* More rounded corners */
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04); /* Deeper shadow */
            z-index: 1000;
            text-align: center;
            opacity: 0; /* Start hidden */
            pointer-events: none;
        }
        .modal.visible {
            animation: fadeIn 0.15s forwards; /* Apply fade-in animation when visible */
            pointer-events: auto;
        }
        .modal.hidden-animation {
            animation: fadeOut 0.15s forwards; /* Apply fade-out animation when hiding */
            pointer-events: none;
        }
    </style>
</head>
<!-- Body with a more vibrant background and improved centering -->
<body class="bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200 min-h-screen flex items-center justify-center p-6">
    <!-- Main Content Area of the webpage - styled for better aesthetics -->
    <div class="relative z-20 max-w-2xl w-full bg-white p-10 rounded-3xl shadow-2xl transition-all duration-300 ease-in-out hover:shadow-3xl">
        <h1 class="text-5xl font-extrabold text-indigo-700 mb-6 text-center leading-tight">
            Explore the Dynamic Canvas
        </h1>
        <p class="text-gray-700 text-xl leading-relaxed mb-6 text-center">
            This page is crafted to demonstrate a unique, responsive interaction. Just move your cursor to experience it!
        </p>
        <p class="text-gray-600 text-lg leading-relaxed mb-8 text-center">
            Every slight movement will trigger a surprising visual cue, showcasing immediate feedback.
        </p>
        <!-- Interactive elements with enhanced styling -->
        <div class="flex flex-col sm:flex-row justify-center items-center gap-6 mt-8">
            <button id="activateAudioBtn" class="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-300">
                Activate Audio
            </button>
            <a href="#" class="text-indigo-600 hover:text-indigo-800 font-semibold text-lg py-4 px-8 transition duration-300 ease-in-out hover:underline">
                Read the Guide
            </a>
        </div>
        <div class="mt-10 text-center">
            <input type="text" placeholder="Type something engaging..." class="w-full sm:w-3/4 px-6 py-4 border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-transparent transition duration-300 ease-in-out text-lg text-gray-800 placeholder-gray-400">
        </div>
        <p class="text-gray-500 text-sm mt-10 text-center">
            *This demonstration highlights immediate visual responses to user input, specifically with every cursor movement.
        </p>
    </div>
    <!-- Overlay for "Freezing" Effect - Uses 'visible' and 'hidden' classes for control -->
    <div id="overlay" class="overlay"></div>
    <!-- Custom Alert Modal - Uses 'visible' and 'hidden' classes for control, with animation classes -->
    <div id="customModal" class="modal">
        <div class="text-6xl mb-4 animate-bounce-slow">
            <span role="img" aria-label="Warning Icon">🚨</span>
        </div>
        <h2 class="text-4xl font-extrabold text-indigo-700 mb-3">Movement Detected!</h2>
        <p class="text-gray-700 text-xl mb-6">Oops! Your cursor moved again.</p>
        <button id="modalCloseBtn" class="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 px-7 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300">
            Acknowledge
        </button>
    </div>
    <script>
        // Ensure the DOM is fully loaded before executing the script
        document.addEventListener('DOMContentLoaded', () => {
            // Get references to the overlay, modal, and close button elements
            const overlay = document.getElementById('overlay');
            const customModal = document.getElementById('customModal');
            const modalCloseBtn = document.getElementById('modalCloseBtn');
            const activateAudioBtn = document.getElementById('activateAudioBtn'); // New button for audio activation
            let flashTimeout; // Timer to control how long the modal/overlay stays visible
            let frogSound; // Declare frogSound globally so it can be initialized once
            // Initialize Tone.js components for the frog sound using Tone.NoiseSynth
            // Tone.NoiseSynth generates a noise-based sound with an envelope, great for percussive effects.
            frogSound = new Tone.NoiseSynth({
                noise: {
                    type: 'brown' // 'brown' noise sounds deeper and more natural for a croak
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.2, // Short decay for a quick croak
                    sustain: 0.0,
                    release: 0.2 // Quick release
                }
            }).toDestination(); // Connect the synth directly to the speakers
            // Ensure the audio context is resumed on a user interaction
            // This is necessary because browsers block audio until a user interacts with the page.
            activateAudioBtn.addEventListener('click', async () => {
                if (Tone.context.state !== 'running') {
                    await Tone.start();
                    console.log('Audio context resumed!');
                }
                // Hide the activate audio button once clicked
                activateAudioBtn.style.display = 'none';
            });
            /**
             * Plays the frog sound.
             */
            const playFrogSound = () => {
                // Ensure audio context is running before playing
                if (Tone.context.state === 'running') {
                    // Trigger the NoiseSynth to play. The duration can be adjusted.
                    frogSound.triggerAttackRelease("0.3s"); // Play for 0.3 seconds
                } else {
                    console.warn('Audio context not running. Click "Activate Audio" first.');
                }
            };
            /**
             * Displays the overlay and modal with a subtle animation.
             * It then sets a timeout to hide them again after a brief period.
             */
            const showFreezeAndAlert = () => {
                // Play the frog sound every time the mouse moves
                playFrogSound();
                // Clear any existing timeout to ensure the flash duration resets with each new movement
                clearTimeout(flashTimeout);
                // Ensure modal is reset for re-animation if it was just hidden
                customModal.classList.remove('hidden-animation');
                // Add 'visible' class to show the overlay and modal
                overlay.classList.add('visible');
                customModal.classList.add('visible');
                // Set a new timeout to hide them after a slightly longer duration (e.g., 500ms)
                // This makes the interruption more noticeable and "irritating".
                flashTimeout = setTimeout(() => {
                    overlay.classList.remove('visible');
                    // Apply the fade-out animation before fully hiding
                    customModal.classList.add('hidden-animation');
                    customModal.classList.remove('visible');
                    // Remove the animation class after it completes to prepare for next display
                    setTimeout(() => customModal.classList.remove('hidden-animation'), 150);
                }, 500); // Increased duration to make it more 'irritating'
            };
            // Attach a 'mousemove' event listener to the entire document body.
            // This will trigger 'showFreezeAndAlert' every time the cursor moves.
            document.body.addEventListener('mousemove', showFreezeAndAlert);
            // Event listener for the "Acknowledge" button on the modal.
            // If clicked, it immediately hides the modal and overlay and clears any pending timeouts.
            modalCloseBtn.addEventListener('click', () => {
                clearTimeout(flashTimeout); // Clear timeout if user clicks 'Acknowledge'
                overlay.classList.remove('visible');
                customModal.classList.add('hidden-animation'); // Apply fade-out animation
                customModal.classList.remove('visible');
                // Remove the animation class after it completes
                setTimeout(() => customModal.classList.remove('hidden-animation'), 150);
            });
        });
    </script>
</body>
</html>

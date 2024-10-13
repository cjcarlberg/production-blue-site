// Ensure the DOM is fully loaded before executing scripts
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    /* Utility Functions */
    function logError(message, error) {
        console.error(`${message}:`, error);
        // You could add more sophisticated error handling here, like sending to a logging service
    }

    /* Element Selectors */
    const videoOverlay = document.getElementById('videoOverlay');
    const videoPlayer = document.getElementById('videoPlayer');
    const closeVideoButton = document.getElementById('closeVideoButton');
    const playPauseButton = document.getElementById('playPauseButton');
    const blobMenu = document.querySelector('.blob-menu');
    const blobItems = document.querySelectorAll('.blob-item');
    const workItems = document.querySelectorAll('.work-item');

    // Debug: Check if elements are correctly selected
    if (!videoOverlay || !videoPlayer || !closeVideoButton || !playPauseButton) {
        logError('One or more video overlay elements are missing');
        return; // Exit if essential elements are missing
    }

    console.log('All necessary elements found');

    /* Video Functions */
    function openVideo(videoSrc) {
        console.log(`Attempting to open video: ${videoSrc}`);
        const fullVideoPath = `assets/videos/${videoSrc}`;
        console.log(`Full video path: ${fullVideoPath}`);
        
        videoPlayer.src = fullVideoPath;
        videoOverlay.classList.add('active');
        
        // Mute the video to allow autoplay
        videoPlayer.muted = true;
        
        // Wait for metadata to load before playing
        videoPlayer.addEventListener('loadedmetadata', () => {
            console.log('Video metadata loaded');
            videoPlayer.play().then(() => {
                console.log('Video playback started successfully');
                playPauseButton.innerHTML = '&#10074;&#10074;'; // Pause symbol
            }).catch(error => {
                logError('Error attempting to play the video', error);
            });
        }, { once: true }); // Remove listener after it fires once
        
        videoPlayer.addEventListener('error', (e) => {
            logError('Video loading error', e);
        }, { once: true });
    }

    function closeVideo() {
        console.log('Closing video');
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
        videoOverlay.classList.remove('active');
        playPauseButton.innerHTML = '&#9658;'; // Play symbol
        videoPlayer.src = ''; // Clear the source
    }

    function togglePlayPause() {
        if (videoPlayer.paused) {
            videoPlayer.play().then(() => {
                console.log('Video resumed');
                playPauseButton.innerHTML = '&#10074;&#10074;'; // Pause symbol
            }).catch(error => {
                logError('Error attempting to resume the video', error);
            });
        } else {
            videoPlayer.pause();
            console.log('Video paused');
            playPauseButton.innerHTML = '&#9658;'; // Play symbol
        }
    }

    /* Event Listeners */
    playPauseButton.addEventListener('click', togglePlayPause);
    closeVideoButton.addEventListener('click', closeVideo);

    workItems.forEach(item => {
        item.addEventListener('click', (event) => {
            console.log('Work item clicked');
            const videoSrc = item.getAttribute('data-video');
            if (videoSrc) {
                openVideo(videoSrc);
            } else {
                console.warn('No video source found for this work item');
            }
        });
    });

    // Direct click event on blob videos
    document.querySelectorAll('.blob-video').forEach(blob => {
        blob.addEventListener('click', (event) => {
            console.log('Blob video clicked');
            event.stopPropagation();
            const workItem = blob.closest('.work-item');
            if (workItem) {
                const videoSrc = workItem.getAttribute('data-video');
                if (videoSrc) {
                    openVideo(videoSrc);
                } else {
                    console.warn('No video source found for this blob video');
                }
            } else {
                console.warn('Could not find parent work-item for this blob video');
            }
        });
    });

    // Fade in video overlay on activation
    videoOverlay.addEventListener('transitionend', () => {
        if (videoOverlay.classList.contains('active')) {
            console.log('Video overlay activated');
            gsap.fromTo(videoOverlay, { opacity: 0 }, { opacity: 1, duration: 0.5 });
        } else {
            console.log('Video overlay deactivated');
            gsap.fromTo(videoOverlay, { opacity: 1 }, { opacity: 0, duration: 0.5 });
        }
    });

    /* Blob Menu Enhancement */
    blobItems.forEach(blob => {
        blob.addEventListener('click', (e) => {
            console.log('Blob item clicked');
            // Ripple Effect
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');
            const rect = blob.getBoundingClientRect();
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top = `${e.clientY - rect.top}px`;
            blob.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600); // Remove after animation

            // Scroll to section
            const sectionId = blob.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
                console.log(`Scrolled to section: ${sectionId}`);
            } else {
                console.warn(`Section with ID '${sectionId}' not found`);
            }
        });
    });

    /* GSAP Animations */
    if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
        console.log('GSAP loaded, setting up animations');
        
        gsap.registerPlugin(ScrollTrigger);

        // Hover effect for blob items
        blobItems.forEach(blob => {
            blob.addEventListener('mouseover', () => {
                gsap.to(blob, { scale: 1.1, duration: 0.3, ease: 'power2.out' });
            });
            blob.addEventListener('mouseout', () => {
                gsap.to(blob, { scale: 1, duration: 0.3, ease: 'power2.out' });
            });
        });

        // Randomize blob positions on page load
        window.addEventListener('load', () => {
            blobItems.forEach(blob => {
                const randomX = (Math.random() - 0.5) * 20;
                const randomY = (Math.random() - 0.5) * 20;
                gsap.to(blob, { x: randomX, y: randomY, duration: 1, ease: 'power2.out' });
            });
        });

        // Animate section headings
        gsap.utils.toArray('section h2').forEach(heading => {
            gsap.from(heading, {
                opacity: 0,
                y: 50,
                duration: 1,
                scrollTrigger: {
                    trigger: heading,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animate content in Why and How sections
        ['why-content', 'how-content'].forEach(sectionClass => {
            const content = document.querySelector(`.${sectionClass}`);
            if (content) {
                gsap.from(content.children, {
                    opacity: 0,
                    y: 30,
                    stagger: 0.2,
                    duration: 0.8,
                    scrollTrigger: {
                        trigger: content,
                        start: "top 70%",
                        toggleActions: "play none none reverse"
                    }
                });
            }
        });

        // Animate work items
        gsap.from('.work-item', {
            opacity: 0,
            y: 50,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
                trigger: '.work-grid',
                start: "top 70%",
                toggleActions: "play none none reverse"
            }
        });

        // Parallax effect for background elements
        gsap.utils.toArray('.section-overlay').forEach(overlay => {
            gsap.to(overlay, {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: overlay.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });

        // Floating effect for blob items and work items
        gsap.utils.toArray('.blob-item, .work-item').forEach(item => {
            gsap.to(item, {
                y: -20,
                duration: 2 + Math.random() * 2,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
            });
        });
    } else {
        console.warn('GSAP not loaded, animations will not work');
    }

    console.log('Script initialization complete');
});
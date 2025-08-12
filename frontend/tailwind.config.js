export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,jsx,ts,tsx}",
		"./components/**/*.{js,jsx,ts,tsx}",
		"./app/**/*.{js,jsx,ts,tsx}",
		"./src/**/*.{js,jsx,ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))',
					soft: 'hsl(var(--primary-soft))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					soft: 'hsl(var(--success-soft))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
					soft: 'hsl(var(--warning-soft))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
					soft: 'hsl(var(--destructive-soft))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					soft: 'hsl(var(--success-soft))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
					soft: 'hsl(var(--warning-soft))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-out': {
					'0%': { transform: 'translateX(0)', opacity: '1' },
					'100%': { transform: 'translateX(20px)', opacity: '0' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'scale-out': {
					'0%': { opacity: '1', transform: 'scale(1)' },
					'100%': { opacity: '0', transform: 'scale(0.95)' }
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'bounce-soft': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
					'50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' }
				},
				'gradient': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'typewriter': {
					'0%': { width: '0' },
					'100%': { width: '100%' }
				},
				'blink': {
					'0%, 50%': { opacity: '1' },
					'51%, 100%': { opacity: '0' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(30px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-down': {
					'0%': { opacity: '0', transform: 'translateY(-30px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-left': {
					'0%': { opacity: '0', transform: 'translateX(-30px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'fade-in-right': {
					'0%': { opacity: '0', transform: 'translateX(30px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'zoom-in': {
					'0%': { opacity: '0', transform: 'scale(0.5)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'zoom-out': {
					'0%': { opacity: '1', transform: 'scale(1)' },
					'100%': { opacity: '0', transform: 'scale(0.5)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(0)' }
				},
				'slide-left': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-right': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'rotate-in': {
					'0%': { opacity: '0', transform: 'rotate(-200deg)' },
					'100%': { opacity: '1', transform: 'rotate(0deg)' }
				},
				'rotate-out': {
					'0%': { opacity: '1', transform: 'rotate(0deg)' },
					'100%': { opacity: '0', transform: 'rotate(200deg)' }
				},
				'flip-in': {
					'0%': { opacity: '0', transform: 'perspective(400px) rotateY(90deg)' },
					'100%': { opacity: '1', transform: 'perspective(400px) rotateY(0deg)' }
				},
				'flip-out': {
					'0%': { opacity: '1', transform: 'perspective(400px) rotateY(0deg)' },
					'100%': { opacity: '0', transform: 'perspective(400px) rotateY(-90deg)' }
				},
				'bounce-in': {
					'0%': { opacity: '0', transform: 'scale(0.3)' },
					'50%': { opacity: '1', transform: 'scale(1.05)' },
					'70%': { transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'bounce-out': {
					'0%': { opacity: '1', transform: 'scale(1)' },
					'25%': { transform: 'scale(0.95)' },
					'100%': { opacity: '0', transform: 'scale(0.3)' }
				},
				'flash': {
					'0%, 50%, 100%': { opacity: '1' },
					'25%, 75%': { opacity: '0' }
				},
				'rubber-band': {
					'0%': { transform: 'scale(1)' },
					'30%': { transform: 'scaleX(1.25) scaleY(0.75)' },
					'40%': { transform: 'scaleX(0.75) scaleY(1.25)' },
					'60%': { transform: 'scaleX(1.15) scaleY(0.85)' },
					'100%': { transform: 'scale(1)' }
				},
				'shake-x': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(5px)' }
				},
				'shake-y': {
					'0%, 100%': { transform: 'translateY(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateY(-5px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateY(5px)' }
				},
				'heart-beat': {
					'0%': { transform: 'scale(1)' },
					'14%': { transform: 'scale(1.3)' },
					'28%': { transform: 'scale(1)' },
					'42%': { transform: 'scale(1.3)' },
					'70%': { transform: 'scale(1)' }
				},
				'jello': {
					'0%, 100%': { transform: 'translate3d(0, 0, 0)' },
					'15%': { transform: 'translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg)' },
					'30%': { transform: 'translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg)' },
					'45%': { transform: 'translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg)' },
					'60%': { transform: 'translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg)' },
					'75%': { transform: 'translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg)' }
				},
				'tada': {
					'0%': { transform: 'scale(1)' },
					'10%, 20%': { transform: 'scale(0.9) rotate(-3deg)' },
					'30%, 50%, 70%, 90%': { transform: 'scale(1.1) rotate(3deg)' },
					'40%, 60%, 80%': { transform: 'scale(1.1) rotate(-3deg)' },
					'100%': { transform: 'scale(1) rotate(0deg)' }
				},
				'wobble': {
					'0%': { transform: 'translateX(0%)' },
					'15%': { transform: 'translateX(-25%) rotate(-5deg)' },
					'30%': { transform: 'translateX(20%) rotate(3deg)' },
					'45%': { transform: 'translateX(-15%) rotate(-3deg)' },
					'60%': { transform: 'translateX(10%) rotate(2deg)' },
					'75%': { transform: 'translateX(-5%) rotate(-1deg)' },
					'100%': { transform: 'translateX(0%)' }
				},
				'swing': {
					'20%': { transform: 'rotate(15deg)' },
					'40%': { transform: 'rotate(-10deg)' },
					'60%': { transform: 'rotate(5deg)' },
					'80%': { transform: 'rotate(-5deg)' },
					'100%': { transform: 'rotate(0deg)' }
				},
				'hinge': {
					'0%': { transform: 'rotate(0deg)', transformOrigin: 'top left' },
					'20%, 60%': { transform: 'rotate(80deg)', transformOrigin: 'top left' },
					'40%': { transform: 'rotate(60deg)', transformOrigin: 'top left' },
					'80%': { transform: 'rotate(60deg)', transformOrigin: 'top left' },
					'100%': { transform: 'rotate(60deg)', transformOrigin: 'top left' }
				},
				'roll-in': {
					'0%': { opacity: '0', transform: 'translateX(-100%) rotate(-120deg)' },
					'100%': { opacity: '1', transform: 'translateX(0) rotate(0deg)' }
				},
				'roll-out': {
					'0%': { opacity: '1', transform: 'translateX(0) rotate(0deg)' },
					'100%': { opacity: '0', transform: 'translateX(100%) rotate(120deg)' }
				},
				'light-speed-in': {
					'0%': { opacity: '0', transform: 'translateX(-100%) skewX(30deg)' },
					'60%': { opacity: '1', transform: 'translateX(20%) skewX(-30deg)' },
					'80%': { transform: 'translateX(-5%) skewX(15deg)' },
					'100%': { transform: 'translateX(0) skewX(0deg)' }
				},
				'light-speed-out': {
					'0%': { opacity: '1', transform: 'translateX(0) skewX(0deg)' },
					'100%': { opacity: '0', transform: 'translateX(100%) skewX(-30deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'slide-out': 'slide-out 0.3s ease-in',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-in',
				'spin-slow': 'spin-slow 3s linear infinite',
				'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
				'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
				'shake': 'shake 0.5s ease-in-out',
				'wiggle': 'wiggle 1s ease-in-out',
				'float': 'float 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'gradient': 'gradient 3s ease infinite',
				'typewriter': 'typewriter 3s steps(40) 1s both',
				'blink': 'blink 1s infinite',
				'fade-in-up': 'fade-in-up 0.5s ease-out',
				'fade-in-down': 'fade-in-down 0.5s ease-out',
				'fade-in-left': 'fade-in-left 0.5s ease-out',
				'fade-in-right': 'fade-in-right 0.5s ease-out',
				'zoom-in': 'zoom-in 0.3s ease-out',
				'zoom-out': 'zoom-out 0.3s ease-in',
				'slide-up': 'slide-up 0.3s ease-out',
				'slide-down': 'slide-down 0.3s ease-out',
				'slide-left': 'slide-left 0.3s ease-out',
				'slide-right': 'slide-right 0.3s ease-out',
				'rotate-in': 'rotate-in 0.5s ease-out',
				'rotate-out': 'rotate-out 0.5s ease-in',
				'flip-in': 'flip-in 0.6s ease-out',
				'flip-out': 'flip-out 0.6s ease-in',
				'bounce-in': 'bounce-in 0.6s ease-out',
				'bounce-out': 'bounce-out 0.6s ease-in',
				'flash': 'flash 1s ease-in-out',
				'rubber-band': 'rubber-band 0.6s ease-out',
				'shake-x': 'shake-x 0.5s ease-in-out',
				'shake-y': 'shake-y 0.5s ease-in-out',
				'heart-beat': 'heart-beat 1.3s ease-in-out infinite',
				'jello': 'jello 0.9s ease-in-out',
				'tada': 'tada 1s ease-in-out',
				'wobble': 'wobble 1s ease-in-out',
				'swing': 'swing 1s ease-in-out',
				'hinge': 'hinge 2s ease-in-out',
				'roll-in': 'roll-in 0.6s ease-out',
				'roll-out': 'roll-out 0.6s ease-in',
				'light-speed-in': 'light-speed-in 1s ease-out',
				'light-speed-out': 'light-speed-out 1s ease-in'
			}
		}
	},
	plugins: [require("tailwindcss-animate")]
}; 
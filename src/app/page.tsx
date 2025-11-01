'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Logo } from '@/components/logo'
import { SplashScreen } from '@/components/splash-screen'
import { Target, Users, MessageCircle, MapPin, Calendar, TrendingUp, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-orange-950/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Logo className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Aktiv
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                Stay{' '}
                <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Accountable
                </span>
                <br />
                Achieve Your Goals
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Connect with like-minded people who share your goals. Find accountability partners online or workout buddies nearby in Bangalore.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg px-8 py-6">
                    Start Free Today
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">500+</div>
                <div className="text-sm text-muted-foreground mt-1">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">10k+</div>
                <div className="text-sm text-muted-foreground mt-1">Goals Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">95%</div>
                <div className="text-sm text-muted-foreground mt-1">Success Rate</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Two Ways to Stay{' '}
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Consistent
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you need virtual accountability or real-world workout partners, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Accountability Mode */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-xl border border-border"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Accountability Mode</h3>
              <p className="text-muted-foreground mb-6">
                Find virtual partners who share your goals. Check in daily, share progress, and keep each other motivated through our real-time chat.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Match with people who have similar goals</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Daily check-ins with photo proof</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Track streaks and celebrate wins</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Real-time messaging and support</span>
                </li>
              </ul>
            </motion.div>

            {/* IRL Mode */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-xl border border-border"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">IRL Mode (Bangalore)</h3>
              <p className="text-muted-foreground mb-6">
                Discover people nearby who want to work out, run, or train together. Create or join activities and build real-world connections.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Find workout buddies within your area</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Create or join group activities</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Distance-based matching</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Safe meetups with verified users</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-border"
            >
              <MessageCircle className="w-10 h-10 text-orange-600 mb-4" />
              <h4 className="font-semibold mb-2">Real-Time Chat</h4>
              <p className="text-sm text-muted-foreground">
                Instant messaging with your accountability partners
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-border"
            >
              <Calendar className="w-10 h-10 text-orange-600 mb-4" />
              <h4 className="font-semibold mb-2">Daily Check-ins</h4>
              <p className="text-sm text-muted-foreground">
                Track progress with photos and build your streak
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-border"
            >
              <TrendingUp className="w-10 h-10 text-orange-600 mb-4" />
              <h4 className="font-semibold mb-2">Progress Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Visualize your journey and celebrate milestones
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-border"
            >
              <Users className="w-10 h-10 text-orange-600 mb-4" />
              <h4 className="font-semibold mb-2">Smart Matching</h4>
              <p className="text-sm text-muted-foreground">
                Algorithm finds partners with shared interests
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-border"
            >
              <Target className="w-10 h-10 text-orange-600 mb-4" />
              <h4 className="font-semibold mb-2">Goal Categories</h4>
              <p className="text-sm text-muted-foreground">
                Fitness, learning, nutrition, and 7 more categories
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-border"
            >
              <MapPin className="w-10 h-10 text-orange-600 mb-4" />
              <h4 className="font-semibold mb-2">Location-Based</h4>
              <p className="text-sm text-muted-foreground">
                Find people within your preferred distance
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Get Started in{' '}
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of people who are crushing their goals together
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Your Goals</h3>
              <p className="text-muted-foreground">
                Set up your goals and choose your preferred mode: virtual accountability or IRL meetups.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Find Your Match</h3>
              <p className="text-muted-foreground">
                Our smart algorithm connects you with people who share your goals and commitment level.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Stay Consistent</h3>
              <p className="text-muted-foreground">
                Check in daily, share progress, and keep each other accountable. Build your streak together.
              </p>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-12 text-center text-white"
          >
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Achieve Your Goals?
            </h3>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join our community and start building the habits that will transform your life. It's completely free to get started.
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-6">
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo className="w-6 h-6" />
              <span className="font-semibold text-sm">Aktiv</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Aktiv. Build accountability, together.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">
                Login
              </Link>
              <Link href="/signup" className="hover:text-foreground transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

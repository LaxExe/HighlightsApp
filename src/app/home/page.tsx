
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  ArrowRight,
  Target,
  Users,
  TrendingUp,
  Check,
  Calendar,
  Flame,
  Trophy,
  Hash,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const FEED_ENTRIES = [
  {
    initials: 'LM',
    name: 'Liam',
    day: 'Tuesday',
    score: 8,
    streaks: ['Gym', 'Coding'],
    tags: ['fitness', 'work'],
    highlights: [
      'Reviewed for 5 hours at the library for the ECE final',
      'Played a game of League with the boys after the session',
      'Hit shoulders at the gym after class',
      'Had a coffee chat with Alexia downtown',
    ],
  },
  {
    initials: 'SP',
    name: 'Sofia',
    day: 'Thursday',
    score: 9,
    streaks: ['Internship applications', 'Reading'],
    tags: ['career', 'learning'],
    highlights: [
      'Applied to 14 internship positions today',
      'Tailored my resume for the co-op cycle',
      'Went on a date at a French restaurant downtown',
      'Reviewed interview questions before bed',
    ],
  },
  {
    initials: 'RJ',
    name: 'Ryan',
    day: 'Saturday',
    score: 7,
    streaks: ['Swimming'],
    tags: ['health', 'social'],
    highlights: [
      'Swam 800m at the rec center',
      'Went biking with friends after practice',
      'Watched Project Hail Mary with Ethan tonight',
      'Spent an hour organizing my calendar for next week',
      'Called my parents to catch up on the weekend',
      'Started planning a Wonderland trip for June',
    ],
  },
  {
    initials: 'AK',
    name: 'Aisha',
    day: 'Wednesday',
    score: 8,
    streaks: ['Journaling', 'Spanish'],
    tags: ['creative', 'learning'],
    highlights: [
      'Finished editing my photography portfolio',
      'Did a full Spanish lesson during the commute',
      'Had sushi with my cousins after work',
      'Worked on branding ideas for my side project',
      'Stayed up late talking with Marcus on FaceTime',
    ],
  },
  {
    initials: 'DT',
    name: 'Daniel',
    day: 'Friday',
    score: 9,
    streaks: ['Early wakeups', 'Gym', 'Cold emails'],
    tags: ['career', 'fitness', 'social'],
    highlights: [
      'Woke up at 6:15 and got straight to work',
      'Sent cold emails to 6 founders in Toronto',
      'Had a networking call with a product manager at Shopify',
      'Worked on the backend for my startup project',
      'Played basketball at the park for two hours',
      'Grabbed bubble tea with friends after the gym',
      'Watched a documentary before bed',
    ],
  },
]



// ─── Nav ─────────────────────────────────────────────────────────────────────

function TopNav({ isLoggedIn, onLogout }: { isLoggedIn: boolean; onLogout: () => void }) {
  return (
    <div className="border-b border-base-200 sticky top-0 bg-base-50 z-40 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/favicon.png"
            alt="Highlights"
            width={28}
            height={28}
            className="rounded"
          />
          <span className="text-xl font-bold text-base-800">Highlights</span>
        </Link>

        {isLoggedIn ? (
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-semibold transition-all cursor-pointer text-sm"
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/auth"
            className="px-4 py-2 rounded-lg bg-accent text-base-800 font-semibold transition-all hover:bg-accent-hover text-sm"
          >
            Sign Up
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="border-b border-base-200 bg-base-100">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-widest text-base-400 font-semibold mb-4">
            For people who want more from their days
          </p>

          <h1 className="text-5xl md:text-6xl font-black text-base-800 mb-6 leading-tight">
            Make your days
            <br />
            <span className="text-accent">actually count.</span>
          </h1>

          <p className="text-lg text-base-600 leading-relaxed mb-10 max-w-2xl">
  Highlights is a quick place to log your day, reflect on what mattered, and stay connected with friends working toward their own goals.
  <br /><br />
  Through social accountability, streaks, rewards, and AI-powered analytics and cataloguing, Highlights helps you stay consistent and leverage your social network to actually make progress toward the goals you care about, making your days actually meaningful.
</p>


          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-base-800 text-base-700 font-semibold hover:bg-base-700 transition-colors"
          >
            Start Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Feed Entry ──────────────────────────────────────────────────────────────

function FeedEntry({ entry }: { entry: typeof FEED_ENTRIES[0] }) {
  return (
    <div className="flex-shrink-0 w-80 border border-base-200 rounded-xl bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-base-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-base-100 border border-base-200 flex items-center justify-center">
            <span className="text-xs font-semibold text-base-500">
              {entry.initials}
            </span>
          </div>

          <div>
            <p className="text-sm font-semibold text-base-700">
              {entry.name}
            </p>
            <p className="text-xs text-base-400">{entry.day}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-base-200 bg-base-50 px-2.5 py-1">
          <Trophy size={12} className="text-base-400" />
          <span className="text-xs font-semibold text-base-600">
            {entry.score}/10
          </span>
        </div>
      </div>

      <div className="px-5 py-4 border-b border-base-100">
        <div className="space-y-2">
          {entry.highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-base-200 bg-base-50 mt-0.5">
                <span className="text-[10px] font-semibold text-base-400">
                  {i + 1}
                </span>
              </div>

              <p className="text-sm text-base-600 leading-snug">{h}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-3 flex flex-col gap-2">
        {entry.streaks.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Flame size={13} className="text-base-400 shrink-0" />

            {entry.streaks.map((s) => (
              <span
                key={s}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md border border-green-200 bg-green-50 text-green-700"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {entry.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Hash size={13} className="text-base-400 shrink-0" />

            {entry.tags.map((t) => (
              <span
                key={t}
                className="text-[11px] text-base-500 px-2 py-0.5 rounded-md border border-base-200 bg-base-50"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Feed Carousel ───────────────────────────────────────────────────────────

function FeedCarousel() {
  const [index, setIndex] = useState(0)
  const total = FEED_ENTRIES.length

  const prev = () => setIndex((i) => (i - 1 + total) % total)
  const next = () => setIndex((i) => (i + 1) % total)

  useEffect(() => {
    const t = setInterval(next, 4000)
    return () => clearInterval(t)
  }, [])

  const visible = [
    FEED_ENTRIES[index % total],
    FEED_ENTRIES[(index + 1) % total],
    FEED_ENTRIES[(index + 2) % total],
  ]

  return (
    <section className="py-20 border-t border-base-200">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm uppercase tracking-widest text-base-400 font-semibold mb-2">
              From the feed
            </p>

            <h2 className="text-3xl font-black text-base-800">
              What people are up to
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={prev}
              className="p-2 rounded-lg border border-base-200 bg-base-100 text-base-500 hover:bg-base-200 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={next}
              className="p-2 rounded-lg border border-base-200 bg-base-100 text-base-500 hover:bg-base-200 transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex gap-4 overflow-hidden">
          {visible.map((entry, i) => (
            <div
              key={`${entry.name}-${index}-${i}`}
              className={`transition-all duration-300 ${
                i === 2 ? 'hidden lg:block opacity-60' : ''
              }`}
            >
              <FeedEntry entry={entry} />
            </div>
          ))}
        </div>

        <div className="flex gap-1.5 mt-6">
          {FEED_ENTRIES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index % total
                  ? 'w-5 bg-base-600'
                  : 'w-1.5 bg-base-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How it works ────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section className="py-20 border-t border-base-200 bg-base-100">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-black text-base-800 mb-12">
          How it works
        </h2>

        <div className="space-y-8">
          {[
            {
              icon: Check,
              title: 'Log a few things from your day',
              body: 'Each day, write down 3–5 things that actually happened — something you learned, someone you caught up with, a habit you kept. Takes under a minute.',
            },
            {
              icon: Trophy,
              title: 'Get a score and see your streaks',
              body: 'AI reflects back a daily score. Streaks surface habits you’re building. Over time you start to see patterns you didn’t know were there.',
            },
            {
              icon: Users,
              title: 'Friends might see your day',
              body: 'There’s a chance your entries show up for people you follow. Not every day — just enough to keep things real without it feeling like a performance.',
            },
            {
              icon: TrendingUp,
              title: 'Watch the weeks add up',
              body: 'A month of small entries becomes a record of real growth. The goal you wrote down in January starts to look a lot closer.',
            },
          ].map(({ icon: Icon, title, body }, i) => (
            <div key={i} className="flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent text-base-800 font-bold text-lg">
                  {i + 1}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-base-800 mb-2">
                  {title}
                </h3>

                <p className="text-base-600 leading-relaxed">{body}</p>
              </div>

              <div className="hidden md:flex items-center justify-center flex-shrink-0">
                <Icon size={32} className="text-accent opacity-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Why it works ────────────────────────────────────────────────────────────

function WhyItWorks() {
  const benefits = [
    {
      icon: Calendar,
      title: 'Frictionless',
      description:
        'You’re not filling out a form or tracking metrics. Just writing a few lines about your day. The bar is low enough that you’ll actually do it.',
    },
    {
      icon: Users,
      title: 'Social without the pressure',
      description:
        'Your friends might see your week — but it’s not a feed you’re curating. No likes. No comparison. Just the quiet knowledge that someone might notice.',
    },
    {
      icon: TrendingUp,
      title: 'Progress becomes visible',
      description:
        'Streaks, scores, and heatmaps make growth tangible. You stop guessing whether things are adding up — you can see that they are.',
    },
    {
      icon: Target,
      title: 'Your goals, your terms',
      description:
        'You define what a good day looks like. The app doesn’t tell you what to optimize. It just helps you show up for whatever you care about.',
    },
  ]

  return (
    <section className="py-20 border-t border-base-200">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-black text-base-800 mb-6">
          Why it sticks
        </h2>

        <div className="max-w-3xl mb-12">
          <p className="text-lg text-base-600 leading-relaxed">
            Highlights is an AI-powered social network for daily reflection and
            streak tracking that helps users make their days more meaningful
            while building a searchable catalog of their experiences, habits,
            and personal growth.
          </p>

          <p className="text-base text-base-500 leading-relaxed mt-4">
            Daily highlights are analyzed through an AI pipeline that
            automatically organizes information, updates goal-based streaks,
            surfaces behavioral patterns, and occasionally shares moments with a
            user’s social network to create lightweight accountability and
            connection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map(({ icon: Icon, title, description }, idx) => (
            <div
              key={idx}
              className="p-8 border border-base-200 rounded-lg bg-base-50 hover:border-accent transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-base-100 flex items-center justify-center mb-4">
                <Icon size={24} className="text-accent" />
              </div>

              <h3 className="text-lg font-bold text-base-800 mb-2">
                {title}
              </h3>

              <p className="text-base-600 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Who it's for ────────────────────────────────────────────────────────────

function WhoItFor() {
  const users = [
    'People who keep saying they’ll start tomorrow',
    'Anyone trying to pick up a new skill',
    'Friends who want to stay in each other’s lives',
    'People working toward something and want to see it',
    'Anyone who ends the day wondering where it went',
    'Anyone who just wants to live a little more intentionally',
  ]

  return (
    <section className="py-20 border-t border-base-200 bg-base-100">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-black text-base-800 mb-12">
          Built for real people
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-4 border border-base-200 rounded-lg bg-white"
            >
              <Check size={20} className="text-accent flex-shrink-0" />

              <span className="text-base-600 font-medium">{user}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="py-24 border-t border-base-200">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-black text-base-800 mb-4">
          Your days are already happening.
        </h2>

        <h3 className="text-3xl font-black text-accent mb-8">
          Start noticing them.
        </h3>

        <p className="text-lg text-base-600 mb-12 leading-relaxed">
          Free to join. No tracking, no algorithm, no performance. Just you,
          your day, and the people you care about.
        </p>

        <Link
          href="/auth"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-base-800 text-base-700 font-bold text-lg hover:bg-base-700 transition-colors"
        >
          Sign Up for Free
          <ArrowRight size={20} />
        </Link>

        <p className="text-sm text-base-400 mt-6">
          Free forever. Your data stays yours.
        </p>
      </div>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-base-50 text-base-700">
      <TopNav isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Hero />
      <FeedCarousel />
      <HowItWorks />
      <WhyItWorks />
      <WhoItFor />
      <FinalCTA />
    </div>
  )
}


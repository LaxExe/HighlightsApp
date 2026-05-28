interface StreakData {
  id: string
  currentStreak: number
  bestStreak: number
  history: Date[]
}

interface StreakUpdate {
  currentStreak: number
  bestStreak: number
  history: Date[]
}

/**
 * Calculates the updated streak fields based on whether the streak condition was met today.
 */
export function calculateStreakUpdate(
  streak: StreakData,
  met: boolean,
  today: Date
): StreakUpdate {
  let { currentStreak, bestStreak, history } = streak
  const newHistory = [...history]

  if (met) {
    const todayStr = today.toISOString().split('T')[0]
    const alreadyLogged = newHistory.some(
      (d) => new Date(d).toISOString().split('T')[0] === todayStr
    )

    if (!alreadyLogged) {
      newHistory.push(today)
      currentStreak += 1
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak
      }
    }
  } else {
    currentStreak = 0
  }

  return {
    currentStreak,
    bestStreak,
    history: newHistory,
  }
}

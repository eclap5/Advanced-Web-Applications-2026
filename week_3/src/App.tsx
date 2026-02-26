import { useMemo, useState } from 'react'
import HabitList from './components/HabitList'

export interface Habit {
  id: number
  name: string
  completed: boolean
}

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: 1, name: 'Drink water', completed: false },
    { id: 2, name: 'Exercise', completed: false },
    { id: 3, name: 'Read a book', completed: false }
  ])

  const [newHabit, setNewHabit] = useState<string>('')

  /**
   * This is one of the key factors in React to understand. 
   * When we update the state, we need to create a new array (or object) instead of mutating the existing one. 
   * This allows React to detect the change and re-render the component accordingly.
   * 
   * It is essential for students to learn following pattern:
   * 
   * setState(prev =>
      prev.map(item =>
        condition ? updatedItem : item
     )
    );
   * 
   * When preserving the existing state to the prev, we ensure that we are working with the most up-to-date state.
   * Then, we use the map function to iterate over the array and create a new array based on the condition.
   * If the condition is met (e.g., the habit's id matches the id we want to toggle), we return a new object with the updated completed status.
   * Now when state object is updated, React will re-render the component and reflect the changes in the UI.
  */
  const toggleHabit = (id: number) => {
    setHabits(prev =>
      prev.map(habit => habit.id === id ? { ...habit, completed: !habit.completed } : habit)
    )
  }

  const addHabit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (newHabit.trim() === '') 
      return

    setHabits((prev) => {
      const nextId = Math.max(0, ...prev.map(habit => habit.id)) + 1
      const newHabitObj: Habit = {
        id: nextId,
        name: newHabit,
        completed: false
      }
      return [...prev, newHabitObj]
    })
    setNewHabit('')
  }


  /**
   * useMemo is a React hook that allows us to memoize the result of a function so that it only recomputes when its dependencies change.
   * In this case, without the useMemo, the completedCount and percentage would be recalculated on every render, even if the habits array hasn't changed.
   * By using useMemo, we ensure that the calculations for completedCount and percentage are only performed when the habits array changes, improving performance.
   * The dependencies array [habits] tells React to only recompute the values when the habits state changes, preventing unnecessary recalculations on every render.
   */
  const { completedCount, percentage } = useMemo(() => {
    const completedCount = habits.filter(habit => habit.completed).length
    const percentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0
    return { completedCount, percentage }
  }, [habits])

  return (
    <div className='container'>
      <div className='card'>
        <h1>Daily Habit Tracker</h1>

        {/* If useMemo is not implemented, we can use this simpler version of progression */}
        {/* <p>
          Completed: {completedCount} / {habits.length} ({percentage}%)
        </p> */}

        <div className="progressWrap" aria-label="Completion progress">
          <div className="progressBar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
            <div className="progressFill" style={{ width: `${percentage}%` }} />
            <div className="progressText">{percentage}%</div>
          </div>
          <div className="progressMeta">
            Completed: {completedCount} / {habits.length}
          </div>
        </div>

        <form className="addForm" onSubmit={addHabit}>
          <input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Add a new habit…"
            maxLength={60}
          />
          <button type="submit">Add</button>
        </form>

        <HabitList habits={habits} onToggle={toggleHabit} />
      </div>
    </div>
  )


}



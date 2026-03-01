import type { Habit } from '../App'

// This component is responsible for rendering a single habit item in the list.
// It receives the habit object and the onToggle function as props from the parent component (HabitList).
// It is important to understand how to pass props down to child components and how to use functions as props.
interface HabitItemProps {
    habit: Habit;
    onToggle: (id: number) => void;
}

export default function HabitItem({ habit, onToggle }: Readonly<HabitItemProps>) {
    return (
        <li className='item'>
            <span className={habit.completed ? 'done' : ''}>
                {habit.name}
            </span>
            <button onClick={() => onToggle(habit.id)}>
                {habit.completed ? 'Undo' : 'Mark Done'}
            </button>
        </li>
    )
}
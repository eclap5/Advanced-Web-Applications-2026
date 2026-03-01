import type { Habit } from '../App'
import HabitItem from './HabitItem';

interface HabitListProps {
    habits: Habit[];
    onToggle: (id: number) => void;
}

export default function HabitList({ habits, onToggle }: Readonly<HabitListProps>) {
    return (
        <ul className='list'>
            {habits.map(habit => (
                <HabitItem 
                    key={habit.id} 
                    habit={habit} 
                    onToggle={onToggle} 
                />
            ))}
        </ul>
    )
}
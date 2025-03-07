"use client"

import { useState } from "react"
import { Check, Trash, Edit, Clock, Calendar, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import TaskDetailPopup from "./TaskDetailPopup"

export interface Task {
    id: string
    title: string
    description?: string
    due_date?: string | null
    completed: boolean
    priority: 'low' | 'medium' | 'high'
    user_id: string
    list_id?: string | null
}

export interface TaskList {
    id: string;
    name: string;
    color: string;
    user_id: string;
    created_at: string;
}

interface TaskItemProps {
    task: Task
    taskLists?: TaskList[]
    onComplete: (id: string, completed: boolean) => void
    onDelete: (id: string) => void
    onEdit: (task: Task) => void
    isAdmin?: boolean
    isOwnedByCurrentUser?: boolean
}

export function TaskItem({
    task,
    taskLists = [],
    onComplete,
    onDelete,
    onEdit,
    isAdmin = false,
    isOwnedByCurrentUser = true
}: TaskItemProps) {
    const [isHovered, setIsHovered] = useState(false)
    // No longer need local state for popup since it's handled by parent

    // Format the due date if it exists
    const formattedDueDate = task.due_date
        ? format(new Date(task.due_date), "MMM d, yyyy h:mm a")
        : null

    // Determine if the task is due today
    const isToday = task.due_date
        ? new Date(task.due_date).toDateString() === new Date().toDateString()
        : false

    // Determine if the task is due tomorrow
    const isTomorrow = task.due_date
        ? new Date(task.due_date).toDateString() === new Date(Date.now() + 86400000).toDateString()
        : false

    // Format date as "Wednesday, June 3" for dates beyond tomorrow
    const formattedDay = task.due_date && !isToday && !isTomorrow
        ? format(new Date(task.due_date), "EEEE, MMMM d")
        : null

    // Determine if the task is overdue
    const isOverdue = task.due_date
        ? new Date(task.due_date) < new Date() && !task.completed
        : false

    // Get priority color
    const getPriorityColor = () => {
        switch (task.priority) {
            case 'high':
                return 'bg-red-500'
            case 'medium':
                return 'bg-yellow-500'
            case 'low':
                return 'bg-green-500'
            default:
                return 'bg-blue-500'
        }
    }

    // Determine if the current user can edit/delete this task
    const canModify = isAdmin || isOwnedByCurrentUser

    return (
        <div
            className={cn(
                "px-4 py-2 transition-all duration-200 relative group",
                task.completed ? "opacity-70" :
                    isOverdue ? "bg-red-50/10" : "bg-transparent"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        "flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border cursor-pointer flex items-center justify-center",
                        task.completed ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-gray-500"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (canModify) onComplete(task.id, !task.completed);
                    }}
                >
                    {task.completed && <Check className="h-3 w-3 text-white" />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <h3 className={cn(
                            "font-medium text-sm",
                            task.completed && "line-through text-gray-500"
                        )}>
                            {task.title}
                        </h3>

                        <div className="flex items-center gap-1 ml-2">
                            {/* Priority indicator removed */}

                            {(isHovered || isOverdue) && canModify && (
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(task);
                                        }}
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(task.id);
                                        }}
                                    >
                                        <Trash className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Task list indicator removed from here - will be shown where date was */}

                    {task.description && (
                        <p className={cn(
                            "text-xs text-gray-500 mt-1 line-clamp-2",
                            task.completed && "line-through"
                        )}>
                            {task.description}
                        </p>
                    )}

                    {/* Replace date display with task list indicator */}
                    <div className="flex items-center mt-2 text-xs text-foreground">
                        {/* Use Tag icon instead of Clock/Calendar */}
                        <Tag className="h-3 w-3 mr-1" />

                        <span className={cn(
                            "font-medium",
                            task.completed && "line-through"
                        )}>
                            {task.list_id && taskLists.find(list => list.id === task.list_id)
                                ? taskLists.find(list => list.id === task.list_id)?.name
                                : "Personal"}
                        </span>
                    </div>

                    {!isOwnedByCurrentUser && (
                        <div className="mt-2 text-xs text-gray-500 italic">
                            Owned by another user
                        </div>
                    )}
                </div>
            </div>

            {/* Click to open task details - calls the parent's onEdit function */}
            <div
                className="absolute inset-0 cursor-pointer"
                onClick={() => onEdit(task)}
            ></div>

            {/* Task detail popup is now handled by the parent (TaskList) component */}
        </div>
    )
}

export default TaskItem

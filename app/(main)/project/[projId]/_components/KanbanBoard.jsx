"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Edit2, Plus } from "lucide-react";
import Image from "next/image";
import { updateTaskStatus, deleteTask } from "@/actions/tasks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoldTitle, GrayTitle } from "@/components/custom/reusables";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MDEditor from "@uiw/react-md-editor";
import { Input } from "@/components/ui/input";

const COLUMNS = [
    { key: "TODO", name: "Todo" },
    { key: "INPROGRESS", name: "In Progress" },
    { key: "INREVIEW", name: "In Review" },
    { key: "COMPLETED", name: "Done" },
];

const PRIORITY_STYLES = {
    URGENT: {
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.1)",
        border: "rgba(239, 68, 68, 0.2)",
    },
    HIGH: {
        color: "#f97316",
        bg: "rgba(249, 115, 22, 0.1)",
        border: "rgba(249, 115, 22, 0.2)",
    },
    MEDIUM: {
        color: "#eab308",
        bg: "rgba(234, 179, 8, 0.1)",
        border: "rgba(234, 179, 8, 0.2)",
    },
    LOW: {
        color: "#22c55e",
        bg: "rgba(34, 197, 94, 0.1)",
        border: "rgba(34, 197, 94, 0.2)",
    },
};

const TaskPreviewDialog = ({ open, onClose, task }) => {
    console.log(task);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className={"border border-amber-300/25 bg-linear-to-br from-amber-300/25 via-transparent to-transparent"}>
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-3xl">
                            <GoldTitle>{task.title}</GoldTitle>
                        </DialogTitle>
                    </div>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex gap-2">
                            <GrayTitle className="text-sm font-semibold">Status</GrayTitle>
                            <Badge variant="secondary">
                                {task.status}
                            </Badge>
                        </div>
                        <div className="flex gap-2">
                            <GrayTitle className="text-sm font-semibold px-1">Priority</GrayTitle>
                            <Badge variant={task.priority === "URGENT" ? "destructive" : task.priority === "HIGH" ? "secondary" : task.priority === "MEDIUM" ? "default" : "outline"}>
                                {task.priority}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                        <GrayTitle>Create At:</GrayTitle>
                        <p>{new Date(task.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <GrayTitle className="font-semibold">Description</GrayTitle>
                        <div className="border border-white/5 rounded-md">
                            <MDEditor.Markdown
                                className="rounded px-2 py-1 max-h-50 overflow-y-auto md-preview-scroll"
                                source={task.description ? task.description : "--"}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex flex-col items-center gap-2">
                            <h4 className="font-semibold">Assignee</h4>
                            <Image
                                src={task.assignedTo.imageUrl}
                                alt={task.assignedTo.name || "Assignee"}
                                width={40}
                                height={40}
                                className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0"
                            />
                            <GrayTitle>{task.assignedTo.name}</GrayTitle>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <h4 className="font-semibold">Reporter</h4>
                            <Image
                                src={task.assignedBy.imageUrl}
                                alt={task.assignedBy.name || "Reporter"}
                                width={40}
                                height={40}
                                className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0"
                            />
                            <GrayTitle>{task.assignedBy.name}</GrayTitle>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

const TaskCard = ({ task, onDelete, onEdit, userRole }) => {
    const priority = task.priority?.toUpperCase() || "LOW";
    const pStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES.LOW;

    const [previewTask, setPreviewTask] = useState(false);

    return (
        <>
            <Card
                className="cursor-pointer transition-all duration-200 relative overflow-hidden group/card mb-3 bg-amber-300/5 hover:bg-amber-300/10 hover:scale-95"
                onClick={() => setPreviewTask(true)}
            >
                {/* Top Color Bar for Priority */}
                <div
                    className="h-1 w-full absolute top-0 left-0 z-10"
                    style={{ backgroundColor: pStyle.color }}
                />

                {/* Hover Action Buttons */}
                {userRole === "ADMIN" && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 transition-all duration-200 flex gap-1.5 z-20 bg-zinc-900/90 backdrop-blur-md p-1 rounded-lg border border-white/10 shadow-lg">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                            className="text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
                        >
                            <Edit2 size={13} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                            className="text-white/40 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-white/5"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                )}

                <CardHeader className="pt-6 pb-2 px-4 flex items-center justify-between">
                    <CardTitle className="text-[15px] font-medium text-white/90 leading-snug pr-8">
                        {task.title}
                    </CardTitle>
                    <div
                        className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 border rounded-full"
                        style={{
                            backgroundColor: pStyle.bg,
                            color: pStyle.color,
                            borderColor: pStyle.border
                        }}
                    >
                        {task.priority}
                    </div>
                </CardHeader>

                <CardContent className="px-4 pb-3 flex flex-wrap gap-2">
                    <GrayTitle>
                        <p className="text-sm">
                            {task.description.slice(0, 100)}...
                        </p>
                    </GrayTitle>
                </CardContent>

                <CardFooter className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-white/5 bg-white/1">
                    {task.assignedTo ? (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                                <Image
                                    src={task.assignedTo.imageUrl}
                                    alt={task.assignedTo.name || "Assignee"}
                                    width={30}
                                    height={30}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <span className="text-[10px] text-white/40 truncate max-w-20 font-medium">
                                {task.assignedTo.name || task.assignedTo.email}
                            </span>
                        </div>
                    ) : (
                        <span className="text-[10px] text-white/20 italic font-light">Unassigned</span>
                    )}

                    <span className="text-[10px] text-white/25 font-medium">
                        {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                    </span>
                </CardFooter>
            </Card>

            <TaskPreviewDialog open={previewTask} onClose={() => setPreviewTask(false)} task={task} />
        </>
    );
};

export default function KanbanBoard({ tasks, onTaskUpdate, onEditTask, onAddTask, userRole }) {
    const [isMounted, setIsMounted] = useState(false);
    const [columns, setColumns] = useState({});

    // Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [filterAssigneeId, setFilterAssigneeId] = useState(null);
    const [filterPriority, setFilterPriority] = useState("");

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Extract unique assignees from tasks prop
    const assignees = React.useMemo(() => {
        return Array.from(
            new Map(
                tasks
                    .filter(t => t.assignedTo)
                    .map(t => [t.assignedTo.id, t.assignedTo])
            ).values()
        );
    }, [tasks]);

    const clearAllFilters = () => {
        setSearchTerm("");
        setFilterAssigneeId(null);
        setFilterPriority("");
    };

    // Filter and update columns when tasks or filters change
    useEffect(() => {
        const initialColumns = COLUMNS.reduce((acc, col) => {
            const colTasks = tasks.filter(t => t.status === col.key);
            const filteredColTasks = colTasks.filter(task => {
                const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

                const matchesAssignee = !filterAssigneeId || task.assignedTo?.id === filterAssigneeId;
                const matchesPriority = !filterPriority || task.priority === filterPriority;

                return matchesSearch && matchesAssignee && matchesPriority;
            });
            acc[col.key] = filteredColTasks;
            return acc;
        }, {});
        setColumns(initialColumns);
    }, [tasks, searchTerm, filterAssigneeId, filterPriority]);

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) return;

        const sourceCol = [...columns[source.droppableId]];
        const destCol =
            source.droppableId === destination.droppableId
                ? sourceCol
                : [...columns[destination.droppableId]];

        const [movedTask] = sourceCol.splice(source.index, 1);
        movedTask.status = destination.droppableId;
        destCol.splice(destination.index, 0, movedTask);

        setColumns({
            ...columns,
            [source.droppableId]: sourceCol,
            [destination.droppableId]: destCol,
        });

        try {
            await updateTaskStatus(draggableId, destination.droppableId);
            onTaskUpdate();
        } catch (error) {
            toast.error(error.message || "Failed to update task status");
            onTaskUpdate();
        }
    };

    const handleDelete = async (taskId) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await deleteTask(taskId);
                toast.success("Task deleted successfully");
                onTaskUpdate();
            } catch (error) {
                toast.error(error.message || "Failed to delete task");
            }
        }
    };

    if (!isMounted) return null;

    return (
        <div className="flex flex-col gap-5 px-6">
            {/* Filter Section */}
            <div className="flex flex-wrap items-center gap-4 bg-zinc-950/40 my-4 p-1 rounded-xl border border-white/5 max-w-6xl mx-auto w-full">
                {/* Search Input */}
                <div className="relative flex-1 min-w-50 max-w-xs">
                    <Input
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/5 border-white/10 focus:border-amber-400/50 text-white placeholder-white/30 pl-3 pr-8 py-2 text-sm rounded-lg"
                    />
                </div>

                {/* Assignees Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40 font-medium">Assignee:</span>
                    <div className="flex -space-x-1 overflow-hidden p-1">
                        {assignees.map((assignee) => {
                            const isSelected = filterAssigneeId === assignee.id;
                            return (
                                <button
                                    key={assignee.id}
                                    onClick={() => setFilterAssigneeId(isSelected ? null : assignee.id)}
                                    className={`relative rounded-full transition-all duration-200 hover:scale-110 hover:z-10 focus:outline-none`}
                                    title={assignee.name || assignee.email}
                                >
                                    <Image
                                        src={assignee.imageUrl}
                                        alt={assignee.name || "Assignee"}
                                        width={28}
                                        height={28}
                                        className={`w-7 h-7 rounded-full object-cover border-2 transition-all ${isSelected
                                            ? "border-amber-400 scale-110 z-10 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                            : "border-zinc-900 opacity-60 hover:opacity-100"
                                            }`}
                                    />
                                </button>
                            );
                        })}
                        {assignees.length === 0 && (
                            <span className="text-xs text-white/20 italic">No assignees</span>
                        )}
                    </div>
                    {filterAssigneeId && (
                        <button
                            onClick={() => setFilterAssigneeId(null)}
                            className="text-[10px] text-amber-400/80 hover:text-amber-400 underline ml-1"
                        >
                            clear
                        </button>
                    )}
                </div>

                {/* Priority Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40 font-medium">Priority:</span>
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="bg-[#141416] border border-white/10 hover:border-white/20 text-white/80 focus:border-amber-400 rounded-lg py-1.5 px-3 text-xs outline-none cursor-pointer transition-colors"
                    >
                        <option value="">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                    </select>
                </div>

                {/* Reset Button */}
                {(searchTerm || filterAssigneeId || filterPriority) && (
                    <button
                        onClick={clearAllFilters}
                        className="text-xs text-red-400/80 hover:text-red-400 ml-auto transition-colors font-medium flex items-center gap-1"
                    >
                        Reset Filters
                    </button>
                )}
            </div>

            <div className="w-full p-2 ">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-4 gap-4 border border-white/5  bg-linear-to-br from-amber-300/25 via-transparent to-transparent rounded-lg p-3">
                        {COLUMNS.map((column) => (
                            <Droppable key={column.key} droppableId={column.key}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-2 flex flex-col min-h-125 "
                                    >
                                        <h3 className="font-semibold mb-2 text-center text-white/80">
                                            {column.name}
                                        </h3>
                                        {columns[column.key]?.map((task, index) => (
                                            <Draggable
                                                key={task.id}
                                                draggableId={task.id}
                                                index={index}
                                            // isDragDisabled={updateTaskLoading}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <TaskCard
                                                            task={task}
                                                            onDelete={handleDelete}
                                                            onEdit={onEditTask}
                                                            userRole={userRole}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                        {column.key === "TODO" && userRole === "ADMIN" && (
                                            <Button
                                                variant="ghost"
                                                className="w-full"
                                                onClick={onAddTask}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Task
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>
            </div>
        </div>
    );
}


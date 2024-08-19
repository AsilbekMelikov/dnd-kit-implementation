import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";
import Draggable from "./Draggable";
import { generateId } from "../lib/utils";

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDraggingItem, setIsDraggingItem] = useState(false);

  const createTask = (columnId: Id) => {
    const newTask = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length}`,
    };

    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: Id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const updateTask = (id: Id, content: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        return { ...task, content };
      })
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const createNewColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
  };

  const deleteColumn = (id: Id) => {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);

    const newTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTasks);
  };

  const handleDragStart = (e: DragStartEvent) => {
    setIsDraggingItem(true);
    if (e.active.data.current?.type === "Column") {
      setActiveColumn(e.active.data.current.column);
      return;
    }
    if (e.active.data.current?.type === "Task") {
      setActiveTask(e.active.data.current.task);
      return;
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);
    setIsDraggingItem(false);

    const { active, over } = e;

    if (!over) return;
    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;
    console.log(activeColumnId);

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (col) => col.id === activeColumnId
      );

      const overColumnIndex = columns.findIndex(
        (col) => col.id === overColumnId
      );
      console.log(activeColumnIndex);
      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  };

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;

    if (!over) return;
    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    // I am dropping a task over another Task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[overIndex]) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";
    // I am dropping a task over a column
    if (isActiveTask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  };

  return (
    <Draggable isDraggingItem={isDraggingItem}>
      <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-10">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="m-auto flex gap-4">
            <div className="flex gap-4">
              <SortableContext items={columnsId}>
                {columns.map((column) => {
                  return (
                    <ColumnContainer
                      key={column.id}
                      column={column}
                      deleteColumn={deleteColumn}
                      setColumns={setColumns}
                      createTask={createTask}
                      tasks={tasks.filter(
                        (task) => task.columnId === column.id
                      )}
                      deleteTask={deleteTask}
                      updateTask={updateTask}
                    />
                  );
                })}
              </SortableContext>
            </div>
            <button
              onClick={() => createNewColumn()}
              className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 flex items-center justify-center"
            >
              <PlusIcon />
              Add column
            </button>
          </div>
          {createPortal(
            <DragOverlay>
              {activeColumn && (
                <ColumnContainer
                  column={activeColumn}
                  deleteColumn={deleteColumn}
                  createTask={createTask}
                  tasks={tasks.filter(
                    (task) => task.columnId === activeColumn.id
                  )}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              )}
              {activeTask && (
                <TaskCard
                  task={activeTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
    </Draggable>
  );
};

export default KanbanBoard;

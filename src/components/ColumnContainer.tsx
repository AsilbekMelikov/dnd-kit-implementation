import { SortableContext, useSortable } from "@dnd-kit/sortable";
import TrashIcon from "../icons/TrashIcon";
import { Column, Id, Task } from "../types";
import { CSS } from "@dnd-kit/utilities";
import {
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useMemo,
  useState,
} from "react";
import PlusIcon from "../icons/PlusIcon";
import TaskCard from "./TaskCard";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  setColumns?: Dispatch<SetStateAction<Column[]>>;
  createTask: (columnId: Id) => void;
  tasks: Task[];
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
}

const ColumnContainer = ({
  column,
  deleteColumn,
  setColumns,
  createTask,
  tasks,
  deleteTask,
  updateTask,
}: Props) => {
  const [editMode, setEditMode] = useState(false);
  const tasksId = useMemo(() => tasks.map((item) => item.id), [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-columnBackgroundColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col opacity-40 border-2 border-rose-500"
      ></div>
    );
  }

  const handleKey = (e: KeyboardEvent, id: Id) => {
    const targetValue = e.target as HTMLInputElement;
    if (e.key === "Enter") {
      if (setColumns !== undefined) {
        setColumns((prev) => {
          return prev.map((item) => {
            if (item.id === id) {
              item.title = targetValue.value;
            }
            return item;
          });
        });
        setEditMode(false);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-columnBackgroundColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
    >
      {/* Column title */}
      <div
        onClick={() => setEditMode(true)}
        {...attributes}
        {...listeners}
        className="bg-mainBackgroundColor text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-columnBackgroundColor border-4 "
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm px-2 py-1">{tasks.length}</span>
            {!editMode && column.title}
            {editMode && (
              <input
                autoFocus
                type="text"
                className="bg-transparent border-none outline-none"
                onBlur={() => setEditMode(false)}
                onKeyDown={(e) => handleKey(e, column.id)}
              />
            )}
          </div>
          <button
            onClick={() => {
              deleteColumn(column.id);
            }}
            className="stroke-gray-500 hover:stroke-white hover:bg-columnBackgroundColor rounded px-1 py-2"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Column task container */}
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksId}>
          {tasks.map((task) => {
            return (
              <TaskCard
                key={task.id}
                task={task}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            );
          })}
        </SortableContext>
      </div>

      {/* Column footer */}
      <button
        onClick={() => createTask(column.id)}
        className="flex gap-2 items-center border-columnBackgroundColor border-2 rounded-md p-4 border-x-columnBackgroundColor hover:bg-mainBackgroundColor hover:text-rose-500 active:bg-black"
      >
        <PlusIcon />
        Add tasks
      </button>
    </div>
  );
};

export default ColumnContainer;

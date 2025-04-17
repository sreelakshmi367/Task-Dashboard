import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTask } from "./SortableTask";
import axios from "axios";
import dayjs from "dayjs";
import { SortableItem } from "./SortableItem";

const statuses = ["todo", "inprogress", "done"];

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate?: string;
  tags?: string[];
  userId: string;
}

const DroppableColumn: React.FC<{ id: string; children: React.ReactNode }> = ({
  id,
  children,
}) => {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef}>{children}</div>;
};

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo",
    dueDate: "",
    tags: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<{ email: string; userId: string } | null>(
    null
  );
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [sortByDueDate, setSortByDueDate] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>(
    {}
  );

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      loadTasks();
    }
  }, []);

  const loadTasks = async () => {
    const localTasks = localStorage.getItem("tasks");
    if (localTasks) {
      setTasks(JSON.parse(localTasks));
    } else {
      const res = await axios.get("https://jsonplaceholder.typicode.com/posts");
      const mockTasks = res.data
        .slice(0, 9)
        .map((item: any, index: number) => ({
          id: `${item.id}`,
          title: item.title,
          description: item.body,
          status: statuses[index % 3],
          userId: user?.userId || "1",
          dueDate: dayjs().add(index, "day").format("YYYY-MM-DD"),
          tags: ["sample"],
        }));
      setTasks(mockTasks);
      localStorage.setItem("tasks", JSON.stringify(mockTasks));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    const newStatus = statuses.find((status) => status === over.id);

    if (activeTask && newStatus && activeTask.status !== newStatus) {
      const updatedTasks = tasks.map((task) =>
        task.id === active.id ? { ...task, status: newStatus } : task
      );
      setTasks(updatedTasks);
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      setNotification({
        message: "Task moved to " + newStatus,
        type: "success",
      });
    }
  };

  const handleOpen = (task?: Task) => {
    if (task) {
      setEditMode(true);
      setSelectedTaskId(task.id);
      setNewTask({
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate || "",
        tags: (task.tags || []).join(", "),
      });
    } else {
      setEditMode(false);
      setNewTask({
        title: "",
        description: "",
        status: "todo",
        dueDate: "",
        tags: "",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTaskId(null);
    setEditMode(false);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleSaveTask = () => {
    const newErrors: { title?: string; dueDate?: string } = {};

    if (!newTask.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!newTask.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else {
      const isFutureOrToday =
        dayjs(newTask.dueDate).isSame(dayjs(), "day") ||
        dayjs(newTask.dueDate).isAfter(dayjs(), "day");

      if (!isFutureOrToday) {
        newErrors.dueDate = "Due date must be today or a future date";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const formattedTask: Task = {
      id: `${Math.random()}`,
      ...newTask,
      userId: user?.userId || "1",
      tags: newTask.tags.split(",").map((tag) => tag.trim()),
    };

    let updatedTasks = [...tasks, formattedTask];
    setNotification({ message: "Task added successfully.", type: "success" });
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    handleClose();
  };

  const handleDeleteTask = () => {
    if (!selectedTaskId) return;
    const updatedTasks = tasks.filter((task) => task.id !== selectedTaskId);
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setNotification({ message: "Task deleted.", type: "success" });
    handleClose();
  };

  const handleLogin = () => {
    const email = prompt("Enter your email:");
    if (email) {
      const userData = { email, userId: email.split("@")[0] };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      loadTasks();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("tasks");
    setUser(null);
    setTasks([]);
  };

  const filteredTasks = tasks
    .filter((task) => task.userId === user?.userId)
    .filter((task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((task) =>
      selectedTag
        ? task.tags?.some((tag) =>
            tag.toLowerCase().includes(selectedTag.toLowerCase())
          )
        : true
    );

  const sortedTasks = sortByDueDate
    ? [...filteredTasks].sort((a, b) =>
        a.dueDate && b.dueDate
          ? dayjs(a.dueDate).isBefore(dayjs(b.dueDate))
            ? -1
            : 1
          : 0
      )
    : filteredTasks;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Button variant="contained" onClick={handleLogin}>
          Login to View Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className={"min-h-screen bg-gray-100 text-black"}>
      <header className="bg-gray-800 text-white p-4 shadow">
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Task Management Dashboard</h1>
            <p className="text-sm">Welcome, {user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <TextField
              className="w-full sm:w-auto bg-white rounded"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{ sx: { backgroundColor: "white", borderRadius: 1 } }}
            />
            <TextField
              className="w-full sm:w-auto bg-white rounded"
              placeholder="Filter by tag..."
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              size="small"
              InputProps={{ sx: { backgroundColor: "white", borderRadius: 1 } }}
            />
            <Button
              size="small"
              className="sm:w-auto h-10"
              variant="contained"
              onClick={() => setSortByDueDate(!sortByDueDate)}
            >
              {sortByDueDate ? "Sort by Title" : "Sort by Due Date"}
            </Button>
            <Button
              size="small"
              className="sm:w-auto h-10"
              variant="contained"
              onClick={() => handleOpen()}
            >
              Add New Task
            </Button>
            <Button
              size="small"
              className="sm:w-auto h-10"
              variant="outlined"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex md:grid md:grid-cols-3 gap-4 min-w-[900px] md:min-w-0">
            {statuses.map((status) => {
              const filtered = sortedTasks.filter(
                (task) => task.status === status
              );
              return (
                <DroppableColumn key={status} id={status}>
                  <div
                    className={`rounded shadow min-h-[300px] flex flex-col ${
                      status === "todo"
                        ? "bg-yellow-100"
                        : status === "inprogress"
                        ? "bg-blue-100"
                        : "bg-green-100"
                    }`}
                  >
                    <div
                      className={`p-2 text-white text-center font-semibold capitalize ${
                        status === "todo"
                          ? "bg-yellow-600"
                          : status === "inprogress"
                          ? "bg-blue-600"
                          : "bg-green-600"
                      }`}
                    >
                      {status}
                    </div>
                    <div className="flex-1 p-4 space-y-2">
                      {filtered.length === 0 ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          className="text-center py-4 italic"
                        >
                          No Task
                        </Typography>
                      ) : (
                        <SortableContext
                          items={sortedTasks
                            .filter((task) => task.status === status)
                            .map((t) => t.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {sortedTasks
                            .filter((task) => task.status === status)
                            .map((task) => (
                              <div key={task.id}>
                                <SortableItem id={task.id}>
                                  {({
                                    attributes,
                                    listeners,
                                    setNodeRef,
                                    style,
                                  }) => (
                                    <div
                                      ref={setNodeRef}
                                      style={style}
                                      {...attributes}
                                      {...listeners}
                                    >
                                      <SortableTask
                                        task={task}
                                        onEdit={() => handleOpen(task)}
                                        onDelete={() => handleDeleteTask()}
                                      />
                                    </div>
                                  )}
                                </SortableItem>
                              </div>
                            ))}
                        </SortableContext>
                      )}
                    </div>
                  </div>
                </DroppableColumn>
              );
            })}
          </div>
        </DndContext>
      </div>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editMode ? "Edit Task" : "Add New Task"}</DialogTitle>
        <DialogContent className="space-y-4 pt-2 pb-4 px-3 sm:px-5">
          <TextField
            label="Title"
            name="title"
            fullWidth
            value={newTask.title}
            onChange={(e) => {
              setNewTask({ ...newTask, title: e.target.value });
              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            error={!!errors.title}
            helperText={errors.title}
          />

          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            minRows={3}
            value={newTask.description}
            onChange={handleChange}
          />
          <TextField
            label="Due Date"
            type="date"
            name="dueDate"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTask.dueDate}
            onChange={(e) => {
              setNewTask({ ...newTask, dueDate: e.target.value });
              const isValidDate =
                dayjs(e.target.value).isSame(dayjs(), "day") ||
                dayjs(e.target.value).isAfter(dayjs(), "day");

              if (e.target.value && isValidDate) {
                setErrors((prev) => ({ ...prev, dueDate: undefined }));
              }
            }}
            error={!!errors.dueDate}
            helperText={errors.dueDate}
          />
          <Select
            fullWidth
            name="status"
            value={newTask.status}
            onChange={handleChange}
          >
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          {editMode && (
            <Button color="error" onClick={handleDeleteTask}>
              Delete
            </Button>
          )}
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTask}>
            {editMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification(null)}
          severity={notification?.type}
          variant="filled"
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Dashboard;

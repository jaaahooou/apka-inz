import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [editingTask, setEditingTask] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    // Fetch tasks from the backend
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/tasks/");
            setTasks(response.data);
            console.log(response)
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    // Add a new task
    const addTask = async () => {
        if (newTask.trim() === "") return;
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/tasks/", {
                title: newTask,
                completed: false,
            });
            setTasks([...tasks, response.data]);
            setNewTask("");
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    // Start editing a task
    const startEditing = (task) => {
        setEditingTask(task);
        setEditingTitle(task.title);
    };

    // Update a task
    const updateTask = async () => {
        if (!editingTask || editingTitle.trim() === "") return;
        try {
            const response = await axios.put(
                `http://127.0.0.1:8000/api/tasks/${editingTask.id}/`,
                { ...editingTask, title: editingTitle }
            );
            setTasks(
                tasks.map((task) => (task.id === editingTask.id ? response.data : task))
            );
            setEditingTask(null);
            setEditingTitle("");
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    // Delete a task
    const deleteTask = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/tasks/${id}/`);
            setTasks(tasks.filter((task) => task.id !== id));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h1>Todo List</h1>
            <div>
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task..."
                    style={{ padding: "5px", marginRight: "10px" }}
                />
                <button onClick={addTask} style={{ padding: "5px" }}>
                    Add Task
                </button>
            </div>

            <ul style={{ listStyle: "none", padding: "0" }}>
                {tasks.map((task) => (
                    <li
                        key={task.id}
                        style={{
                            margin: "10px 0",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        {editingTask && editingTask.id === task.id ? (
                            <div style={{ flex: "1" }}>
                                <input
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    style={{ padding: "5px", width: "80%" }}
                                />
                                <button
                                    onClick={updateTask}
                                    style={{
                                        marginLeft: "10px",
                                        padding: "5px",
                                        background: "green",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                    }}
                                >
                                    Save
                                </button>
                            </div>
                        ) : (
                            <div style={{ flex: "1" }}>
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() =>
                                        updateTask(task.id, {
                                            ...task,
                                            completed: !task.completed,
                                        })
                                    }
                                    style={{ marginRight: "10px" }}
                                />
                                {task.title}
                            </div>
                        )}
                        <div>
                            <button
                                onClick={() => startEditing(task)}
                                style={{
                                    marginRight: "10px",
                                    padding: "5px",
                                    background: "blue",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                }}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => deleteTask(task.id)}
                                style={{
                                    padding: "5px",
                                    background: "red",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
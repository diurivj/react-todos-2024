import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent } from "react";

type Todo = {
  id: number;
  todo: string;
  completed: boolean;
};

export function App() {
  const { data, error, isLoading } = useQuery<{ todos: Todo[] }>({
    queryKey: ["todos"],
    queryFn: () =>
      fetch("https://wd1-todos-api.diurivj.workers.dev/api/diego/todos").then(
        (r) => r.json(),
      ),
  });

  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: (todo: Todo) =>
      fetch("https://wd1-todos-api.diurivj.workers.dev/api/diego/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: todo.id, completed: todo.completed }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (todo: Todo["todo"]) =>
      fetch("https://wd1-todos-api.diurivj.workers.dev/api/diego/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todo }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  function handleOnSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const todo = formData.get("todo");

    if (!todo || typeof todo !== "string") {
      alert("Something went wrong!");
      return;
    }

    createMutation.mutate(todo);
    e.currentTarget.reset();
  }

  const LoadingUI = () => {
    if (isLoading) {
      return (
        <>
          <h1 className="font-medium text-3xl mb-10">Todo list</h1>
          <div className="w-10 h-2 animate-pulse bg-gray-300 mb-2" />
          <div className="w-12 h-2 animate-pulse bg-gray-300 mb-2" />
          <div className="w-14 h-2 animate-pulse bg-gray-300 mb-2" />
          <div className="w-16 h-2 animate-pulse bg-gray-300 mb-2" />
          <div className="w-18 h-2 animate-pulse bg-gray-300 mb-2" />
        </>
      );
    }
    return null;
  };

  const ErrorUI = () => {
    if (error) {
      return <p className="text-lg">Something went wrong!</p>;
    }
    return null;
  };

  const Todos = () => {
    if (data) {
      return (
        <>
          <h1 className="font-medium text-3xl mb-10">Todo list</h1>
          {data.todos.map((todo) => (
            <p
              key={todo.id}
              onClick={() =>
                updateMutation.mutate({ ...todo, completed: !todo.completed })
              }
              className={`text-lg cursor-pointer ${todo.completed ? "line-through" : ""}`}
            >
              {todo.todo}
            </p>
          ))}
        </>
      );
    }
    return null;
  };

  return (
    <main className="p-10 flex flex-col items-center justify-center">
      <LoadingUI />
      <ErrorUI />
      <Todos />
      <form className="mt-10 flex flex-col" onSubmit={handleOnSubmit}>
        <div className="flex flex-col gap-y-2">
          <label htmlFor="todo">Add todo</label>
          <input id="todo" name="todo" type="text" className="border" />
        </div>
      </form>
    </main>
  );
}

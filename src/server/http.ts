import { HttpError } from "@/server/auth";

export function jsonHandler<T>(fn: (request: Request) => Promise<T>) {
  return async ({ request }: { request: Request }) => {
    try {
      const data = await fn(request);
      return Response.json(data);
    } catch (error) {
      if (error instanceof HttpError) {
        return Response.json({ statusMessage: error.message }, { status: error.status });
      }
      console.error(error);
      return Response.json({ statusMessage: "Error interno del servidor" }, { status: 500 });
    }
  };
}

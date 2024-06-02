import { Hono } from "hono";
import type { FC, PropsWithChildren } from "hono/jsx";
import { createContext, useContext } from "hono/jsx";

const apiRouter = new Hono();

const PersonContext = createContext({
  name: "Aadil",
  age: 20,
});

const Intro: FC = () => {
  const person = useContext(PersonContext);
  return (
    <div>
      <h1>Hi, my name is {person.name}</h1>
      <h2>I am {person.age} years old</h2>
    </div>
  );
};

const Layout: FC = ({ children }: PropsWithChildren) => {
  return (
    <html>
      <head>
        <title>wow, what an API</title>
      </head>
      <body
        style={{
          backgroundColor: "lightblue",
        }}
      >
        {children}
      </body>
    </html>
  );
};

const NamePlate: FC<{ name: string }> = ({ name }) => {
  return (
    <div>
      <h1>Hi, my name is {name}</h1>
    </div>
  );
};

apiRouter.get("/", (c) => {
  return c.html(<Intro />);
});

apiRouter.get("/ping", (c) => {
  return c.json({ message: "pinged api successfully" });
});

apiRouter.get("/README", (c) => {
  return new Response(Bun.file("README.md"), {
    headers: {
      "Content-Type": "text/markdown",
      "Content-Disposition": "attachment; filename=README.md",
    },
  });
});

export default apiRouter;

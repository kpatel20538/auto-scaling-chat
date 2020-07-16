import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import {
  Container,
  Section,
  Box,
  Input,
  Textarea,
  Button,
  Level,
  Select,
  Notification,
  Title,
  Heading,
  Field,
  Control,
  Label,
  Help,
} from "rbx";
import "rbx/index.css";
import "./style.css";

const App = () => {
  const [messages, setMessages] = useState({
    main: [],
    aside: [],
    offtopic: [],
  });
  const [channel, setChannel] = useState("main");
  const [clientUser, setClientUser] = useState(
    () => `ExampleUser-${Math.floor(Math.random() * 100)}`
  );
  const [clientMessage, setClientMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState(
    () => new WebSocket("wss://fanout-ingress-kpatel20538.cloud.okteto.net/ws/")
  );

  const sendMessage = () => {
    setIsSending(true);
    fetch("https://api-service-kpatel20538.cloud.okteto.net", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel,
        user: clientUser,
        message: clientMessage,
        timestamp: new Date().toISOString(),
      }),
    })
      .then(() => setIsSending(false))
      .then(() => setIsSending(false));
  };

  useEffect(() => {
    const messageHandler = (event) => {
      console.log(event);
      setMessages((m) => ({
        ...m,
        [channel]: [...m[channel], JSON.parse(event.data)],
      }));
    };

    const errorHandler = (error) => console.error(error);
    const openHandler = () => setIsConnected(true);
    const closeHandler = () => {
      setIsConnected(false);
      setTimeout(500, () =>
        setWs(
          new WebSocket("wss://fanout-ingress-kpatel20538.cloud.okteto.net/ws/")
        )
      );
    };

    ws.addEventListener("message", messageHandler);
    ws.addEventListener("error", errorHandler);
    ws.addEventListener("open", openHandler);
    ws.addEventListener("close", closeHandler);

    return () => {
      ws.removeEventListener("message", messageHandler);
      ws.removeEventListener("error", errorHandler);
      ws.removeEventListener("open", openHandler);
      ws.removeEventListener("close", closeHandler);
    }
  }, [ws]);

  useEffect(() => {
    if (isConnected) ws.send(channel);
  }, [channel, isConnected]);

  return (
    <Section>
      <Container>
        <Title textAlign="centered">
          {isConnected ? "Connected" : "...Connecting"}
        </Title>
        <Field>
          <Label>Channel</Label>
          <Control>
            <Select.Container>
              <Select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <Select.Option value="main"> #Main </Select.Option>
                <Select.Option value="aside"> #Aside </Select.Option>
                <Select.Option value="offtopic"> #Offtopic </Select.Option>
              </Select>
            </Select.Container>
          </Control>
          <Help> The current chat channel</Help>
        </Field>
        <Field>
          <Label>Nickname</Label>
          <Control>
            <Input
              value={clientUser}
              onChange={(e) => setClientUser(e.target.value)}
            />
          </Control>
          <Help> Your Username </Help>
        </Field>
        <Box>
          <Section style={{ height: "400px", overflow: "scroll" }}>
            {messages[channel].map(({ user, message, timestamp }) => (
              <Notification
                key={`${user + timestamp}`}
                color={user === clientUser ? "primary" : "light"}
              >
                <Title size="4">{message}</Title>
                <Title size="6" subtitle>
                  {user}
                </Title>
                <Heading>{timestamp}</Heading>
              </Notification>
            ))}
          </Section>
        </Box>
        <Level>
          <Level.Item>
            <Textarea
              placeholder="Enter Message Here."
              value={clientMessage}
              onChange={(e) => setClientMessage(e.target.value)}
            />
          </Level.Item>
          <Level.Item align="right" style={{ alignSelf: "stretch" }}>
            <Level.Item style={{ height: "100%" }}>
              <Button
                onClick={sendMessage}
                disabled={!isConnected}
                state={isSending ? "loading" : null}
                style={{ height: "100%" }}
              >
                Send
              </Button>
            </Level.Item>
          </Level.Item>
        </Level>
      </Container>
    </Section>
  );
};

render(<App />, document.getElementById("root"));

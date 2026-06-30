fetch("http://localhost:3000/api/support/telegram", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userEmail: "test@test.com",
    userName: "Test User",
    message: "Test Message",
  })
}).then(res => res.json()).then(data => console.log(data));

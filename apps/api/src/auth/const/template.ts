// template.ts
const template = `
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 20px;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      h2 {
        color: #333;
        text-align: center;
      }
      p {
        font-size: 16px;
        color: #555;
        text-align: center;
      }
      .btn {
        display: inline-block;
        padding: 15px 30px;
        background-color: #4CAF50;
        color: white;
        font-size: 18px;
        text-decoration: none;
        border-radius: 5px;
        text-align: center;
        margin-top: 20px;
      }
      .btn:hover {
        background-color: #45a049;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Welcome to Ufitpal!</h2>
      <p>Click the button below to log in to your account:</p>
      <a href="{{loginUrl}}" class="btn">Log in</a>
    </div>
  </body>
</html>
`;

export default template;

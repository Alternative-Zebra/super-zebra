import fs from "fs";

fs.readFile("./main.sz", "utf-8", (err, data) => {
  if (err) throw err;
  console.log(data);
});

fs.readFile("./main.sz", "utf-8", function (err, data) {
  var linhas = data.split(/\r?\n/);
  linhas.forEach(function (linha) {
    console.log(linha); // aqui podes fazer o que precisas com cada linha
  });
});

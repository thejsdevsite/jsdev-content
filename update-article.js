const readline = require("readline");
const yaml = require("js-yaml");
const fs = require("fs");
const uniqid = require('uniqid');
const glob = require("glob");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const fileList = [];
const loadBlogList = () => {
  glob(`${__dirname}/content/**/index.md`, {}, (err, files) => {
    files.forEach(file => {
      const contents = fs
        .readFileSync(file, "utf8")
        .replace(/^(-{3}(([\r\n].*){1,})-{3})([\r\n].*){1,}/igm, "$2")
        .trim();

      const data = yaml.load(contents);
      fileList.push({
        published: false,
        fname: file,
        ...data
      })
    });

    execApp();
  });
}

const displayList = () => {
  const list = [];
  fileList
    .filter(file => file.published === true)
    .forEach(file => {
      const status = file.published ? "Yes" : "No";
      const name = file.primaryAuthor.substr(0, 20);
      const title = file.title.substr(0, 100);

      const parts = [];
      parts.push(file.uid);
      parts.push(status + " ".repeat(9-status.length));
      parts.push(name + " ".repeat(20-name.length));
      parts.push(title + " ".repeat(100-title.length));

      list.push(`| ${parts.join(" | ")} |`);
    });
  
  if (list.length < 1) {
    throw "No matching articles found.";
  }

  //|uid|published|primaryAuthor|title|
  console.log("\nArticles:");
  console.log(`|${"-".repeat(13)}|${"-".repeat(11)}|${"-".repeat(22)}|${"-".repeat(102)}|`)
  console.log(`| uid${" ".repeat(13-4)}| Published | Author${" ".repeat(22-7)}| Title${" ".repeat(102-6)}|`);
  console.log(`|${"-".repeat(13)}|${"-".repeat(11)}|${"-".repeat(22)}|${"-".repeat(102)}|`)
  console.log(list.join("\n"));
  console.log(`|${"-".repeat(13)}|${"-".repeat(11)}|${"-".repeat(22)}|${"-".repeat(102)}|`)
}

const promptSelection = () => {
  rl.question("\nSelect article by uid: ", value => {
    if (!fileList.find(file => file.uid === value && file.published === true)) {
      console.error("Could not find matching uid, please try again");
      promptSelection();
    } else {
      setUpdatedDate(value);
    }
  })
}

const setUpdatedDate = (uid) => {
  const file = fileList.find(file => file.uid === uid);
  if (!file) {
    console.log("Could not find file, exiting!");
    rl.close();
  }
  
  file.updatedDate = new Date().toISOString();

  const updatedFontmatter = `---
${fileToString(file)}
---`;

  rl.question(`Are you sure you want to set a new updated date for ${file.uid}?
1 - Yes
2 - No
> `, value => {
    if (!["1", "2"].includes(value)) {
      console.log("Invalid option, try again");
      promptAction();
    } else if (value === "1") {
      updateFontmatter(file, updatedFontmatter);
    }
  });
}

const updateFontmatter = (file, contents) => {
  const fcontents = fs.readFileSync(file.fname, "utf8");
  const ncontents = fcontents
  .replace(/^(-{3}(([\r\n].*){1,})-{3})(([\r\n].*){1,})/igm, "$4")
    .trim();

  fs.writeFileSync(file.fname, `${contents}

${ncontents}`);
  console.log(`File successfully updated!`);
  console.log("");
  rl.close();
}

const execApp = () => {
  displayList();
  promptSelection();
}

const fileToString = (file) => {
  const parts = [];
  Object
    .keys(file)
    .filter(key => key !== "fname")
    .forEach(key => {
      let val = "";
      if (Array.isArray(file[key])) {
        parts.push(`${key}: ["${file[key].join('","')}"]`);
      } else if (typeof file[key] === "boolean") {
        parts.push(`${key}: ${file[key]}`);
      } else if (typeof file[key] === "Date") {
        parts.push(`${key}: "${file[key].toISOString()}"`);
      } else if (typeof file[key] === "object") {
        parts.push(`${key}: ${window.JSON.stringify(file[key])}`);
      } else {
        parts.push(`${key}: "${file[key]}"`);
      }
    });

    return parts.join("\n");
}

console.log(`thejs.dev article publisher
Author: Justin Mitchell - 2021
This is a helper script to update the date and time a published article was modified
`);

rl.on("close", function () {
  console.log("");
  process.exit(0);
});

loadBlogList();
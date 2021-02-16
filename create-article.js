const readline = require("readline");
const yaml = require("js-yaml");
const fs = require("fs");
const uniqid = require('uniqid');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const importYaml = {};
const extractedData = {};

const data = {};
const questions = [
    { prompt: "Article title", field: "title" },
    { prompt: "Enter description", field: "description" },
    {
        prompt: "Enter up to 4 tags separated by a space", field: "posttags", process: (val) => {
            const arrVal = val.includes(" ") ? val.split(" ") : [val];
            const arrSet = [...new Set(arrVal)]
                .sort()
                .slice(0, 4);

            arrSet.forEach(tag => {
                if (!extractedData.tags.includes(tag)) {
                    throw `Tag (${tag}) is not a valid tag, valid options: ${extractedData.tags.sort().join(" ")}`;
                }
            });

            return arrSet;
        }
    },
    {
        prompt: "Add authors separated by a space", field: "authors", process: (val) => {
            const arrVal = val.includes(" ") ? val.split(" ") : [val];
            const arrSet = [...new Set(arrVal)]
                .sort();

            arrSet.forEach(author => {
                if (!extractedData.authors.includes(author)) {
                    throw `Author (${author}) is not a valid author, valid options: ${extractedData.authors.sort().join(" ")}`;
                }
            });

            return arrSet;
        }
    },
    {
        prompt: "Primary author", field: "primaryAuthor", process: (val) => {
            if (!extractedData.authors.includes(val)) {
                throw `Author (${val}) is not a valid author, valid options: ${extractedData.authors.join(" ")}`;
            }

            return importYaml.author
                .find(author => author.id === val)
                .name;
        }
    }
]

const loadYamls = () => {
    ["author", "tags"]
        .forEach(file => {
            try {
                const contents = fs.readFileSync(`${__dirname}/data/${file}.yaml`, "utf8");
                const data = yaml.load(contents);
                importYaml[file] = data;
            } catch (e) {
                console.error(`Could not YAML load ${file}: ${e}`);
                process.exit(0);
            }
        });

    extractedData.authors = [];
    extractedData.authorNames = [];
    importYaml.author
        .filter(author => author.id !== "thejsdev")
        .forEach(author => {
            extractedData.authors.push(author.id);
            extractedData.authorNames.push(author.name);
        });

    extractedData.tags = [];
    importYaml.tags
        .forEach(tag => {
            extractedData.tags.push(tag.tag);
        })
}

const promptQuestion = (id) => {
    const qn = questions[id];
    rl.question(`${qn.prompt}: `, value => {
        let hasError = false;
        if (qn.process) {
            try {
                data[qn.field] = qn.process(value);
            } catch (e) {
                hasError = true;
                console.error(e + "\n");
                promptQuestion(id);
            }
        } else {
            data[qn.field] = value;
        }

        if (!hasError) {
            if (questions.length > id + 1) {
                promptQuestion(id + 1);
            } else {
                createBlog();
                rl.close();
            }
        }
    });
}

const generateTemplate = () => {
    const template = `---
uid: "${uniqid.process()}"
title: "${data.title}"
date: "${new Date().toISOString()}"
description: "${data.description}"
published: false
posttags: ["${data.posttags.join('","')}"]
authors: ["${data.authors.join('","')}"]
primaryAuthor: "${data.primaryAuthor}"
hero: "./hero.jpg"
---

This is your blog post!`;

    return template;
}

const generateSlug = () => {
    return data.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/ig, "")
        .replace(/ /ig, "-")
        .replace(/-{1,}/ig, "-")
        .replace(/^-/i, "")
        .replace(/-$/i, "");
}

const createBlog = () => {
    const template = generateTemplate();
    const slug = generateSlug();

    if (!fs.existsSync(`${__dirname}/content/blog/${slug}`)) {
        fs.mkdirSync(`${__dirname}/content/blog/${slug}`);
    } else {
        console.error(`${data.title} blog post already exists! Exiting...`);
        process.exit(0);
    }

    fs.writeFileSync(`${__dirname}/content/blog/${slug}/index.md`, template, err => {
        if (err) {
            console.error(`Could not create blog post ${data.title}! Exiting...`);
            process.exit(0);
        }
    });

    fs.copyFileSync(`${__dirname}/content/assets/generic-hero.jpg`, `${__dirname}/content/blog/${slug}/hero.jpg`);
    console.log(`
Successfully generated blog ${data.title}!
Blog: ${__dirname}/content/blog/${slug}
    `);
}

rl.on("close", function () {
    console.log("");
    process.exit(0);
});

loadYamls();
console.log(`thejs.dev article generator
Author: Justin Mitchell - 2021
Answer the following questions to create your blog post
`);

promptQuestion(0);
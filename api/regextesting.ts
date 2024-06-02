const youtubeVideoRegex = new RegExp(
  "^https://www\\.youtube.com/watch?v=\\w+$"
);

const result = "https://www.youtube.com/watch?v=d95PPykB2vE".match(
  /https:\/\/www\.youtube\.com\/watch\?v=\w+/
);
console.log(result);

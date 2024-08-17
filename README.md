# Omnivore Export to CSV

A simple script to export your articles from [Omnivore](https://omnivore.app/) into a CSV format.

## Setup

Install dependencies, using [Bun](https://bun.sh/):
```bash
bun install
```

Rename the `.env.example` file to `.env`:
```bash
mv .env.example .env
```

And replace the XXXs on the `.env` file with your [Omnivore API Key](https://docs.omnivore.app/integrations/api.html#getting-an-api-token).

## Usage

To get and export to CSV all your articles, run the following command:

```bash
bun run index.ts
```

### Filter articles to export

You can pass a [Omnivore search query](https://docs.omnivore.app/using/search.html) to filter the articles that will be exported:
```bash
bun run index.ts --search-query "label:Cooking,Fitness"
```

### Add a label to all exported articles

This is useful if you're going to import the articles to another service, and want to easily know which items came from this export:

```bash
bun run index.ts --add-tag "your_tag_name_here"
```

### Save intermediate JSON files

If you want to get the data in JSON format too:

```bash
bun run index.ts --save-intermediate-files
```

### Export less data

This is will only include the title, url, labels, creation date and description of the articles.   
Saved in a format that can be [imported to Raindrop](https://help.raindrop.io/import#supported-formats):

```bash
bun run index.ts --full-data false
```

### Using all options

You can use and combine all options at once:

```bash
bun run index.ts --save-intermediate-files --full-data false --add-tag "your_tag_name_here" --search-query "label:Cooking,Fitness"
```

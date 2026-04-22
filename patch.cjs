const fs = require("fs");
const path = require("path");

const filePath = "/home/cokiin/Work/cmynd/packages/backend/convex/documents/mutations.ts";
let content = fs.readFileSync(filePath, "utf8");

// Add extractFirstWords import if missing
if (!content.includes("extractFirstWords")) {
    content = content.replace(
        "import {\n  slugExists,\n  addToSlugHistory,\n} from \"./slug_helpers\";",
        "import { extractFirstWords } from \"../../lib/utils/text-manipulation\";\nimport {\n  slugExists,\n  addToSlugHistory,\n} from \"./slug_helpers\";"
    );
    if (!content.includes("extractFirstWords")) {
        content = content.replace(
            "import { slugExists, addToSlugHistory } from \"./slug_helpers\";",
            "import { extractFirstWords } from \"../../lib/utils/text-manipulation\";\nimport { slugExists, addToSlugHistory } from \"./slug_helpers\";"
        );
    }
}

// Function to inject description logic
function injectDescription(str, isPublish) {
    const searchStr = `    const estimatedReadTime = getReadingTimeMinutes(text);\n\n    await ctx.db.patch(args.documentId, {`;
    const replaceStr = `    const estimatedReadTime = getReadingTimeMinutes(text);\n\n    let description = document.description?.trim() || "";\n    if (!description && document.content) {\n      description = extractFirstWords(document.content as JSONContent);\n    }\n    if (!description) {\n      description = "ALGOOOOO";\n    }\n\n    await ctx.db.patch(args.documentId, {`;
    
    if (content.includes(searchStr)) {
        content = content.replace(searchStr, replaceStr);
    }
    
    // Also patch the patch block to include description
    const patchSearchStr = `      estimatedReadTime,\n      updatedAt: Date.now(),`;
    const patchReplaceStr = `      estimatedReadTime,\n      description,\n      updatedAt: Date.now(),`;
    
    if (content.includes(patchSearchStr)) {
        content = content.replace(patchSearchStr, patchReplaceStr);
    }
}

// Inject into first occurrence (publish)
injectDescription();
// Inject into second occurrence (approve)
injectDescription();

fs.writeFileSync(filePath, content);
console.log("Patched successfully");

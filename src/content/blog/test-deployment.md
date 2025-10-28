---
title: "Test Deployment Post"
description: "Testing blog routing on AWS Amplify to diagnose deployment issues"
pubDate: "2025-10-28"
author: "Test Author"
tags: ["Testing", "Deployment"]
draft: true
---

## Test Blog Post

This is a test blog post created to verify that blog routing works correctly on AWS Amplify.

If you can see this page, it means blog posts are deploying and routing correctly.

### Testing Checklist

- Test blog routing: `/blog/test-deployment`
- Test releases routing: `/releases/0.9.0`
- Test alternative pattern: `/release-note/version-v0.1.0`

### Why This Test?

We're trying to diagnose why release pages show 404 on production even though they build successfully. This test will help us understand if:

1. Blog posts work but releases don't (path-specific issue)
2. All dynamic routes fail (general routing issue)
3. Only certain path patterns work (AWS Amplify configuration issue)

### Next Steps

Based on which URLs work, we can adjust the configuration or path structure accordingly.

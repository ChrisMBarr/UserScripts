# UserScripts
A few Tampermonkey/Greasemonkey scripts I've made


# How to use
* Install the [Tampermonkey browser plugin](https://www.tampermonkey.net/) or [GreaseMonkey browser plugin](https://www.greasespot.net/)
* Navigate to one of the scripts either in the `/src/` folder and click the "RAW" button, or click one of the install links below

## Washington Post Paywall Remover
**[📜 Install Washington Post Paywall Remover Script](https://raw.githubusercontent.com/FiniteLooper/UserScripts/main/src/washington-post-paywall-remover.user.js)**

Exactly what you think it does. When you visit the Washington Post website it removes the paywall that blocks you from seeing the whole article. The full text of the article has already been downloaded, they just don't allow you to scroll down to read it. This removes those limitations.

## Job Search Highlighting
**[📜 Install Job Search Highlighting Script](https://raw.githubusercontent.com/FiniteLooper/UserScripts/main/src/job-search-highlighting.user.js)**

### Features
*  Highlight key words, locations, all mentions of money/currency, and your search terms if they are found within job descriptions
*  Optional list of flagged terms in certain categories can be added
*  Works on multiple websites:
   *  Job search sites: dice.com, glassdoor.com, indeed.com, honestjobs.com, linkedin.com, jobot.com, jobsfordevelopers.com, remote.co, remoteok.com startup.jobs, themuse.com, workatastartup.com, workingnomads.com, and ziprecruiter.com
   *  Job application/recruitment sites used by many companies: applytojob.com, avature.net, dejobs.org, greenhouse.io, jobs.lever.co, myworkdayjobs.com, smartmatchjobs.com, testedrecruits.com, and ultipro.com

#### Demo
![indeed](doc-img/job-indeed.gif)

#### Configuration
The key words that will be highlighted are split up into several categories, all of which are highlighted in different colors
| Property                     | Type       | Description                                                                                                                                 |
|:-----------------------------|:-----------|:--------------------------------------------------------------------------------------------------------------------------------------------|
| `flagSecurityClearances`     | `boolean`  | `true` by default - When `true` it will add words related to obtaining a security clearance to the list of flagged terms                    |
| `flagCriminalRecord`         | `boolean`  | `false` by default - When `true` it will add words related to a criminal history, or a background check to the list of flagged terms        |
| `descriptionAlwaysHighlight` | `string[]` | words to always highlight in **yellow** when found in a job description                                                                     |
| `descriptionAlwaysFlag`      | `string[]` | words to always highlight in **red** as "flagged" terms. Not necessarily bad things, but things to be sure you are aware of before applying |
| `workTypesAlwaysHighlight`   | `string[]` | words to always highlight in **purple** as the job type (full time, part time, W2, etc.)                                                    |
| `locationHighlightPattern`   | `RexExp`   | the location(s) of your choice. Defaults to anything remote or in the Charlotte, NC area (that's where I live, change it to your location!) |

For example, when looking for a remote position there are lots of jobs that say "remote from Los Angeles, CA". If you don't live in that city, even though it's remote it doesn't really apply to you. This allows you to highlight the location if it is simply "remote" (with no location) or you can specify things to look for in the location to highlight them for the locations you are interested in.
How to use

After installing you will need to edit the configuration variables described above to match whatever your preferences are.


## Stack Overflow Enhancer
**[📜 Install Stack Overflow Enhancer Script](https://raw.githubusercontent.com/FiniteLooper/UserScripts/main/src/stack-overflow-enhancer.user.js)**

### Features
*  Hides certain items in the right sidebar
*  Highlights/flags tags on a question if specific combinations are found
*  When viewing questions by tag, the current tags are highlighted
*  Dims questioned that have been marked as `[CLOSED]` or `[DUPLICATE]`
*  Allows easy indenting of code/text when editing a question or an answer (not within the snippet editor, just the plain question/answer editor)
*  Adds a button to the question/answer toolbar to convert all tab indentations to spaces
*  Adds "comment snippets" when adding a comment. Helpful if you find yourself re-writing the exact same comment many times (useful for moderating questions from new users)

#### Flagged Tag Combinations
![combo-tags](doc-img/so-combo-tags.png)

#### Comment Snippets
![comment snippet](doc-img/so-comment-snippet.gif)

#### Enhanced editor indenting
![indenting](doc-img/so-indenting.gif)

#### Configuration
| Property                         | Type         | Description                                                                                                  |
|:---------------------------------|:-------------|:-------------------------------------------------------------------------------------------------------------|
| `flagTagCombos`                  | `string[][]` | tags that when all are found in combination on a question they are highlighted in **red**. This is useful when moderating to improve question quality and searchability.  This might alert you that either one of these tags was likely added as a mistake, or that the question asker is using several things in combination that they probably should not be doing |
| `sidebarHideBlogs`               | `boolean`    | hides the yellow **"The Overflow Blog"** from the right sidebar                                              |
| `sidebarHideCollectives`         | `boolean`    | hides the **"Collectives"** from the right sidebar                                                           |
| `sidebarHideAds`                 | `boolean`    | hides the **ads** from the right sidebar                                                                     |
| `sidebarHideHotNetworkQuestions` | `boolean`    | hides the **"Hot Network Questions"** from the right sidebar                                                 |
| `editorIndentSpaces`             | `number`     | number of spaces to use when indenting code.                                                                 |
| `commentSnippets`                | `object[]`   | Each comment snippet has a display `name` property and a `text` property which contains the actual comment   |

After installing you can edit the configuration variables described above to match whatever your preferences are.

## Washington Post Paywall Remover
**[📜 Install Autofill MyWorkday Jobs Resume Script](https://raw.githubusercontent.com/FiniteLooper/UserScripts/main/src/autofill-myworkdayjobs-resume.user.js)**

Applying for jobs via MyWorkday Jobs is cumbersome because many companies use them, but you have to create a new account for each company and re-enter your same resume for each company. It's the same website and yet they don't allow you to import a previously used resume.  This script allow you to store your resume in a JSON format and it puts some buttons in the UI at each step of the application. Just press the buttons and it will auto-fill your details for that step. It saves me a LOT of time if I am applying to many jobs.

Note that options in dropdown menus can change between companies, I guess they can provide their own values. A good example is your gender or ethnicity for the demographic data.
```
ethnicity: [
  "White",
  "White (Not Hispanic or Latino)",
  "White (United States of America)",
  "White (Not Hispanic or Latino) (United States of America)",
],
```
or the degree type for education
```
degreeType: [
  "Bachelor of Science (B.S.)",
  "Bachelors of Science",
  "Bachelor's of Science",
  "Bachelor of Science",
  "BS",
  "Bachelor's Degree",
  "Bachelors Degree",
  "Bachelor Degree",
  "Bachelors",
  "Bachelor",
],
```

The script will do it's best to find a match, and if multiples are found it will select which ever one is first in the provided array.

// ==UserScript==
// @name         Stack Overflow Enhancer
// @namespace    https://github.com/FiniteLooper/UserScripts
// @version      0.5
// @description  Improve some UI/UX stuff on StackOverflow
// @author       Chris Barr
// @homepageURL  https://github.com/FiniteLooper/UserScripts
// @updateURL    https://github.com/FiniteLooper/UserScripts/blob/master/src/stack-overflow-enhancer.user.js
// @match        https://stackoverflow.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=stackoverflow.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";
  var $ = unsafeWindow.jQuery;
  var StackExchange = unsafeWindow.StackExchange;

  //------------------------------------------------------------------------------------------------------------
  // CONFIG
  //------------------------------------------------------------------------------------------------------------
  //Add arrays of tags you want to have flagged/highlighted when they are ALL present on a question
  //The must be lower case
  const flagTagCombos = [
    ["angular", "angularjs"],
    ["angular", "jquery"],
    ["bootstrap", "twitter-bootstrap"],
    ["bootstrap-4", "bootstrap-5"],
  ];

  //Elements to show or hide
  const sidebarHideBlogs = true;
  const sidebarHideCollectives = true;
  const sidebarHideAds = true;
  const sidebarHideHotNetworkQuestions = false;

  //The number of spaces to use when indenting text in the question/answer editor (not the snippet editor)
  const editorIndentSpaces = 2;

  //Save some comments you may need to use commonly when moderating
  //The text may contain certain tokens to be replaced at runtime
  const commentSnippets = [
    {
      name: "Welcome - How To Ask",
      text: "Welcome to StackOverflow! Please take a look at the article on {{LINK_HELP_HOW_TO_ASK}} as it will help you out in the future. Right now your question is missing some details that make it difficult for anyone to answer.",
    },
    {
      name: "Minimal Reproducible Example - No Code",
      text: "Your question seems to be missing some detail. If you want help with your code, it's impossible for anyone to help you if you don't show the code you want help with. In order to help you we need a {{LINK_HELP_MRE}} directly in your question. Please {{LINK_EDIT_YOUR_QUESTION}} and add some code to your question.",
    },
    {
      name: "Minimal Reproducible Example - Add More Code",
      text: "Your question seems to be missing some detail. In order to help you we need a {{LINK_HELP_MRE}} directly in your question. Please {{LINK_EDIT_YOUR_QUESTION}} and add some code to your question.",
    },
    {
      name: "Minimal Reproducible Example - Add Snippet",
      text: "Your question seems to be missing some detail. In order to help you we need a {{LINK_HELP_MRE}} directly in your question. Please {{LINK_EDIT_YOUR_QUESTION}} and click the button in the toolbar that looks like `[<>]` to add a code snippet to your question. When you add it, please be sure that it properly demonstrates the issue you are having.",
    },
    {
      name: "Minimal Reproducible Example - External Code",
      text: "In order to help you we need a {{LINK_HELP_MRE}} directly in your question. Please do not just point us to code linked to another website. Code on that site might change or disappear over time, leaving the question here without any context for future readers. Your question becomes much easier to answer when the code you want help with is actually in the question. Please {{LINK_EDIT_YOUR_QUESTION}} and click the button in the toolbar that looks like `[<>]` to add a code snippet to your question",
    },
    {
      name: "Images of Code",
      text: "Please do not post images of your code and/or error messages. Post the actual text instead. This makes it easier for people to help you and for others to find this question in a search if they have similar issues in the future. Please read over the answers to this question to understand a bit more about this: [Why should I not upload images of code/data/errors?](//meta.stackoverflow.com/q/285551)",
    },
    {
      name: "Converted to Snippet",
      text: "I've edited your question so that your code is now a snippet that can be run directly from your question.",
    },
  ];

  //------------------------------------------------------------------------------------------------------------
  // CUSTOM STYLES
  //------------------------------------------------------------------------------------------------------------
  const classNameTagComboFlag = "SOE--tag-combo-flag";
  const classNameTagCurrentlyViewing = "SOE--tag-currently-viewing";
  const classNameClosedQuestion = "SOE--closed-question";
  GM_addStyle(
    //Note that the CSS rule order matters here for when certain things should be overridden by others
    [
      `.${classNameClosedQuestion} {background-color:var(--powder-050)!important;--_ps-state-fc:var(--powder-500)!important;--_ps-stats-fc:var(--powder-500)!important;--_ps-meta-tags-tag-bg:var(--powder-200)!important;--theme-post-title-color:var(--powder-500);--theme-post-title-color-visited:var(--powder-500);--theme-post-title-color-hover:var(--powder-600);}`,
      `.${classNameClosedQuestion} .post-tag{color:var(--powder-500) !important}`,
      `.${classNameTagCurrentlyViewing} > .post-tag{background-color:var(--green-100)!important;color:var(--green-900)!important;border-color:var(--green-300)!important;}`,
      `.${classNameTagComboFlag} > .post-tag{background-color:var(--red-100)!important;color:var(--red-900)!important;border-color:var(--red-300)!important;}`,
    ].join("")
  );

  //------------------------------------------------------------------------------------------------------------
  // THE CODE
  //------------------------------------------------------------------------------------------------------------
  const $sidebar = $("#sidebar");
  const $mainContent = $("#mainbar");
  const $questionsList = $("#questions");
  const $sidebarItems = $sidebar.children();
  const $questionTags = $mainContent.find(".js-post-tag-list-wrapper");

  //------------------------------------------------------------------------------------------------------------
  //Hide some elements
  if (sidebarHideBlogs) {
    $sidebarItems
      .find(".s-sidebarwidget--header:contains(The Overflow Blog)")
      .parents(".s-sidebarwidget")
      .hide();
  }
  if (sidebarHideCollectives) {
    $sidebarItems
      .find(".s-sidebarwidget--header:contains(Collectives)")
      .parents(".s-sidebarwidget")
      .hide();
  }
  if (sidebarHideAds) {
    $sidebarItems.filter(".js-sidebar-zone").remove();
  }
  if (sidebarHideHotNetworkQuestions) {
    $("#hot-network-questions").hide();
  }

  //------------------------------------------------------------------------------------------------------------
  //Dim closed/duplicate questions
  $mainContent
    .find(
      ".s-post-summary--content-title:contains([closed]), .s-post-summary--content-title:contains([duplicate])"
    )
    .parents(".s-post-summary")
    .addClass(classNameClosedQuestion);

  //------------------------------------------------------------------------------------------------------------
  //Highlight tag being currently viewed
  const tagPathPrefix = "/questions/tagged/";
  if (location.pathname.includes(tagPathPrefix)) {
    const tags = location.pathname
      .replace(tagPathPrefix, "")
      .split("+")
      .map(decodeURIComponent);

    function highlightTags($el) {
      $el
        .find(`a.post-tag`)
        .filter((i, el) => {
          return tags.includes(el.innerText);
        })
        .parent()
        .addClass(classNameTagCurrentlyViewing);
    }

    highlightTags($questionTags);
    highlightTags($sidebar.find(".js-tag"));
  }

  //------------------------------------------------------------------------------------------------------------
  //Highlight question tag combinations
  if ($questionTags.length) {
    $questionTags.each((i, el) => {
      const $tags = $(el).children();
      const tagArr = $tags.get().map((tag) => tag.innerText);
      flagTagCombos.forEach((tagCombo) => {
        const hasCombo = tagCombo.every((v) => tagArr.includes(v));
        if (hasCombo) {
          tagCombo.forEach((tagText) =>
            $tags
              .filter(
                (i, tag) => tag.innerText.trim().toLowerCase() === tagText
              )
              .addClass(classNameTagComboFlag)
          );
        }
      });
    });
  }

  //------------------------------------------------------------------------------------------------------------
  //Easy indent/unindent when editing a question or answer
  const indent = " ".repeat(editorIndentSpaces);
  const unIndentPattern = new RegExp(`^ {${editorIndentSpaces}}`);

  function initCustomizedTextarea($textArea) {
    $textArea.on("keydown", editorKeyListener);

    const $lastEditorButton = $textArea
      .parents(".wmd-container")
      .find(".wmd-button-row .wmd-help-button");
    $(
      `<li class='wmd-button' title='convert all tabs to spaces' style='max-width:50px;padding-top:9px;line-height:1'>tabs to<br>spaces</li>`
    )
      .hover(
        (ev) => {
          $(ev.target).css({
            background: "rgba(255,255,255,0.25)",
            color: "#FFF",
          });
        },
        (ev) => {
          $(ev.target).css({ background: "", color: "" });
        }
      )
      .on("click", (ev) => {
        const lines = $textArea.val().split("\n");
        const replacedIndents = lines
          .map((l) => {
            const tabCount = l.match(/^\t*/)[0].length;
            const spaces = indent.repeat(tabCount);
            return l.replace(/^\t+/, spaces);
          })
          .join("\n");
        $textArea.val(replacedIndents);
      })
      .insertBefore($lastEditorButton);
  }

  function editorKeyListener(ev) {
    const textarea = ev.target;
    const v = textarea.value;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    if (ev.key === "Tab") {
      ev.preventDefault(); //stop the focus from changing
      const isUnIndenting = ev.shiftKey;

      if (startPos === endPos) {
        //nothing selected, just indent/unindent where the cursor is
        let newCursorPos;
        const lineStartPos = v.slice(0, startPos).lastIndexOf("\n") + 1;
        const lineEndPos = v.slice(lineStartPos, v.length).indexOf("/n");
        if (isUnIndenting) {
          const newLineContent = v
            .slice(lineStartPos, lineEndPos)
            .replace(unIndentPattern, "");
          textarea.value =
            v.slice(0, lineStartPos) + newLineContent + v.slice(lineEndPos);
          newCursorPos = Math.max(startPos - editorIndentSpaces, lineStartPos);
        } else {
          textarea.value =
            v.slice(0, lineStartPos) + indent + v.slice(lineStartPos);
          newCursorPos = startPos + editorIndentSpaces;
        }
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      } else {
        //Indent/unindent the selected text
        const lineStartPos = v.slice(0, startPos).lastIndexOf("\n") + 1;
        const selection = v.substring(lineStartPos, endPos);
        let result = "";
        const lines = selection.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (isUnIndenting) {
            //unindent selected lines
            result += lines[i].replace(unIndentPattern, "");
          } else {
            //Indent selected lines
            result += indent + lines[i];
          }

          if (i < lines.length - 1) {
            //add line breaks after all but the last line
            result += "\n";
          }
        }

        textarea.value = v.split(selection).join(result);
        if (isUnIndenting) {
          textarea.setSelectionRange(
            Math.max(startPos - editorIndentSpaces, lineStartPos),
            lineStartPos + result.length
          );
        } else {
          textarea.setSelectionRange(
            startPos + editorIndentSpaces,
            lineStartPos + result.length
          );
        }
      }
    } else if (ev.key === "Enter") {
      //When enter is pressed, maintain the current indentation level

      //We will place the newline character manually, this stops it from being typed
      ev.preventDefault();

      //Get the current indentation level and prefix the new line with the same
      const prevLinePos = v.slice(0, startPos).lastIndexOf("\n") + 1;
      const prevLine = v.slice(prevLinePos, endPos);
      const levels = prevLine.match(/^ */)[0].length / editorIndentSpaces;
      const indentation = indent.repeat(levels);
      textarea.value =
        v.slice(0, endPos) + "\n" + indentation + v.slice(endPos);

      //Set the cursor position
      const newCursorPos = endPos + 1 + indentation.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }
  }

  setTimeout(() => {
    initCustomizedTextarea($("#post-editor textarea"));
  }, 100);

  $mainContent.find(".js-edit-post").on("click", (event) => {
    setTimeout(() => {
      const $textarea = $(event.target)
        .parents(".post-layout")
        .find(".inline-editor textarea");

      initCustomizedTextarea($textarea);
    }, 100);
  });

  $mainContent.find(".js-add-another-answer").on("click", (event) => {
    setTimeout(() => {
      initCustomizedTextarea($("#post-form textarea"));
    }, 100);
  });

  //------------------------------------------------------------------------------------------------------------
  //Pre-written Comment snippets
  $mainContent.find(".js-add-link").on("click", (event) => {
    //Add a dropdown near the comment field
    setTimeout(() => {
      const $commentLayout = $(event.target)
        .parents(".js-post-comments-component")
        .find(".js-comment-form-layout");

      //Don't add it if it already exists!
      if ($commentLayout.find(".s-select").length === 0) {
        const $commentField = $commentLayout.find("textarea");
        const btnWidth = $commentLayout.find("button").parent().width();
        const opts = commentSnippets.map(
          (obj) => `<option value="${obj.text}">${obj.name}</option>`
        );

        $(
          `<div class='s-select my8'><select style='width:${btnWidth}px'><option value=''>Snippets</option>${opts}</select></div>`
        )
          .insertBefore($commentLayout.find(".js-comment-help-link"))
          .find("select")
          .on("change", (snippetChangeEvent) => {
            if (snippetChangeEvent.target.value !== "") {
              const finalCommentStr = replaceCommentTokens(
                snippetChangeEvent.target.value
              );
              $commentField.val(finalCommentStr).trigger("paste");
              snippetChangeEvent.target.value = "";
            }
          });
      }
    }, 10);
  });

  function replaceCommentTokens(commentStr) {
    const tokenMap = {
      LINK_EDIT_YOUR_QUESTION: `[edit your question](//stackoverflow.com/posts/${StackExchange.question.getQuestionId()}/edit)`,
      LINK_HELP_MRE:
        "[Minimal Reproducible Example](//stackoverflow.com/help/minimal-reproducible-example)",
      LINK_HELP_HOW_TO_ASK:
        "[How to Ask a Good Question](//stackoverflow.com/help/how-to-ask)",
    };

    Object.keys(tokenMap).forEach((key) => {
      const pattern = new RegExp("{{" + key + "}}", "g");
      commentStr = commentStr.replace(pattern, tokenMap[key]);
    });

    return commentStr;
  }
})();

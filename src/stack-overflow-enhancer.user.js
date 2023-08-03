// ==UserScript==
// @name         Stack Overflow Enhancer
// @namespace    https://github.com/FiniteLooper/UserScripts
// @version      0.1
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
  //Add arrays of tags you want to have flagged when they are all present on a question
  //The must be lower case
  const flagTagCombos = [
    ["angular", "angularjs"],
    ["angular", "jquery"],
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
      text: "Welcome to StackOverflow! Please take a look at the article on [How to Ask a Good Question](//stackoverflow.com/help/how-to-ask) as it will help you out in the future",
    },
    {
      name: "Minimal Reproducible Example - General",
      text: "Your question seems to be missing some detail. In order to help you we need a [Minimal Reproducible Example](//stackoverflow.com/help/minimal-reproducible-example). Please review that article in that link and edit your question so that it has enough code and detail for someone to be able to help you.",
    },
    {
      name: "Minimal Reproducible Example - External Code",
      text: "Welcome to StackOverflow! Please take a look at the article on [How to Ask a Good Question](//stackoverflow.com/help/how-to-ask) as it will help you out in the future.  Please include your code directly in the question instead of linking to it on another site.  Your question becomes much easier to answer when the code you want help with is actually in the question. Please [edit your question](//stackoverflow.com/posts/{{QUESTION_ID}}/edit) and click the button in the toolbar that looks like `[<>]` to add a code snippet to your question.",
    },
    {
      name: "Images of Code",
      text: "Please do not post images of your code and/or error messages. Post the actual text instead. This makes it easier for people to help you and for others to find this question in a search if they have similar issues in the future.  Please read over the answers to this question: [Why should I not upload images of code/data/errors?](//meta.stackoverflow.com/q/285551)",
    },
  ];

  //------------------------------------------------------------------------------------------------------------
  // HIGHLIGHTING STYLES
  //------------------------------------------------------------------------------------------------------------
  //Set the color for highlighted tag combinations
  GM_addStyle(
    `.js-tag-combo-flag a{background-color:rgb(113, 65, 65)!important;}`
  );

  //------------------------------------------------------------------------------------------------------------
  // THE CODE
  //------------------------------------------------------------------------------------------------------------
  const $sidebarItems = $("#sidebar").children();
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
  //Highlight question tag combinations
  const $questionTags = $(".js-post-tag-list-wrapper");
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
              .addClass("js-tag-combo-flag")
          );
        }
      });
    });
  }

  //------------------------------------------------------------------------------------------------------------
  //Easy indent/unindent when editing a question or answer
  const $editLinks = $(".js-edit-post");
  $editLinks.on("click", (editClickEvent) => {
    setTimeout(() => {
      const $editTextarea = $(editClickEvent.target)
        .parents(".post-layout")
        .find(".inline-editor textarea");

      $editTextarea.on("keydown", editorKeyListener);

      const $lastEditorButton = $editTextarea
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
          const lines = $editTextarea.val().split("\n");
          const replacedIndents = lines
            .map((l) => {
              const tabCount = l.match(/^\t*/)[0].length;
              const spaces = indent.repeat(tabCount);
              return l.replace(/^\t+/, spaces);
            })
            .join("\n");
          $editTextarea.val(replacedIndents);
        })
        .insertBefore($lastEditorButton);
    }, 100);
  });

  $("#post-editor textarea").on("keydown", editorKeyListener);

  const indent = " ".repeat(editorIndentSpaces);
  const unIndentPattern = new RegExp(`^ {${editorIndentSpaces}}`);
  function editorKeyListener(ev) {
    const textarea = ev.target;
    const v = textarea.value;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    if (ev.key === "Tab") {
      event.preventDefault(); //stop the focus from changing
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
        const selection = v.substring(startPos, endPos);
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
        textarea.setSelectionRange(startPos, startPos + result.length);
      }
    } else if (ev.key === "Enter") {
      //When enter is pressed, maintain the current indentation level

      //We will place the newline character manually, this stops it from being typed
      event.preventDefault();

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

  //------------------------------------------------------------------------------------------------------------
  //Pre-written Comment snippets
  $(".js-add-link").on("click", (editClickEvent) => {
    //Add a dropdown near the comment field
    setTimeout(() => {
      const $commentLayout = $(editClickEvent.target)
        .parents(".js-post-comments-component")
        .find(".js-comment-form-layout");
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
    }, 10);
  });

  function replaceCommentTokens(commentStr) {
    const tokenMap = {
      QUESTION_ID: StackExchange.question.getQuestionId(),
    };

    Object.keys(tokenMap).forEach((key) => {
      const pattern = new RegExp("{{" + key + "}}", "g");
      commentStr = commentStr.replace(pattern, tokenMap[key]);
    });

    return commentStr;
  }
})();

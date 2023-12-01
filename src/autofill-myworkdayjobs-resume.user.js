// ==UserScript==
// @name         Auto-Fill MyWorkday Resume
// @namespace    https://github.com/FiniteLooper/UserScripts
// @version      0.11
// @description  Auto-Fill MyWorkday Resume
// @author       Chris Barr
// @homepageURL  https://github.com/FiniteLooper/UserScripts
// @updateURL    https://github.com/FiniteLooper/UserScripts/raw/main/src/autofill-myworkdayjobs-resume.user.js
// @match        *://*.myworkdayjobs.com/*/job/*
// @match        *://*.*.myworkdayjobs.com/*/job/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  const resume = {
    info: {
      legalFirstName: "Christopher",
      legalLastName: "Barr",
      preferredFirstName: "Chris",
      preferredLastName: "Barr",
      country: "United States of America",
      address: "123 Pine St.",
      city: "FakeTown",
      state: "North Carolina",
      postalCode: 12545,
      phoneType: "Mobile",
      phoneNumber: "(555) 555-5555",
    },
    demographics: {
      ethnicity: [
        "White",
        "White (Not Hispanic or Latino)",
        "White (United States of America)",
        "White (Not Hispanic or Latino) (United States of America)",
        "White (Not Hispanic) Region specific: (United States of America)",
      ],
      gender: ["Male", "Male (United States of America)"],
      hispanicOrLatino: "No",
      veteran: ["I am not a protected veteran", "I am not a veteran", "I AM NOT A VETERAN"],
    },
    workHistory: [
      {
        company: "Foo Corp",
        title: "Good Developer",
        location: "Remote",
        startMonth: 3,
        startYear: 2023,
        endMonth: "",
        endYear: "",
        isCurrent: true,
        description: `description here`,
      },
      {
        company: "Bar Inc",
        title: "Better Developer",
        location: "Remote",
        startMonth: 1,
        startYear: 2020,
        endMonth: 3,
        endYear: 2023,
        isCurrent: false,
        description: `description here`,
      },
    ],
    education: [
      {
        schoolName: "Harvard",
        degreeType: [
          "Bachelor of Science (BS or B.Sc)",
          "Bachelor of Science (B.S.)",
          "Bachelor of Science (BS)",
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
        startYear: 2005,
        endYear: 2006,
        gpa: "3.45",
      },
    ],
    languages: [
      {
        name: "English",
        isFluent: true,
        comprehension: ["5 - Fluent", "Fluent"],
        overall: ["5 - Fluent", "Fluent"],
        reading: ["5 - Fluent", "Fluent"],
        speaking: ["5 - Fluent", "Fluent"],
        writing: ["5 - Fluent", "Fluent"],
      },
    ],
    skills: ["Typescript", "JavaScript", "HTML", "CSS", "SCSS", "Angular", "RxJS"],
    urls: ["https://linkedin.com/in/my-name", "https://github.com/my-name"],
  };
  const loopDelay = 400;
  const waitDelay = 500;
  const currentYear = new Date().getFullYear();
  const $ = (s) => document.querySelector(s);
  const $id = (s) => $(`[data-automation-id="${s}"]`);
  const $idCtx = ($ctx, s) => $ctx.querySelector(`[data-automation-id="${s}"]`);
  const click = (el) => el.dispatchEvent(new MouseEvent("click", { bubbles: true }));

  const fill = ($el, val, callback) => {
    if ($el) {
      if ($el.type === "checkbox") {
        if ($el.checked !== val) {
          click($el);
        }
      } else if ($el.type === "button") {
        fillDropdown($el, val);
      } else {
        $el.value = val;
        $el.dispatchEvent(new Event("focusout", { bubbles: true }));
      }

      if (callback) {
        setTimeout(() => {
          callback();
        }, waitDelay);
      }
    }
  };

  const fillDropdown = ($el, val) => {
    click($el);
    const $ddl = $("#" + $el.getAttribute("aria-controls"));

    if (typeof val === "string") {
      const $listItem = [...$ddl.querySelectorAll("li")].find((x) => x.textContent.includes(val));
      if ($listItem) {
        click($listItem);
      }
    } else {
      //An array of possible options to choose from.
      //Select the best option by choosing the one highest in the passed in list
      const $listItems = [...$ddl.querySelectorAll("li")].filter((x) => val.includes(x.textContent));

      if ($listItems.length === 1) {
        click($listItems[0]);
      } else if ($listItems.length > 1) {
        //use the matching item that matches the one closest to the start of the list
        for (const v of val) {
          const match = $listItems.find((d) => d.textContent === v);
          if (match) {
            click(match);
            break;
          }
        }
      }
    }
  };

  const fillYear = ($el, yearVal) => {
    const $inputYear = $idCtx($el, "dateSectionYear-input");
    //Decrease the years from the current year
    const numYears = currentYear - yearVal + 1;
    for (let y = 0; y < numYears; y++) {
      $inputYear.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          code: "ArrowDown",
          key: "ArrowDown",
          keyCode: 40,
        })
      );
    }

    $inputYear.dispatchEvent(new Event("focusout", { bubbles: true }));
  };

  const fillMonthAndYear = ($el, monthVal, year) => {
    const $inputMonth = $idCtx($el, "dateSectionMonth-input");
    //increment the months
    for (let m = 0; m < monthVal; m++) {
      $inputMonth.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          code: "ArrowUp",
          key: "ArrowUp",
          keyCode: 38,
        })
      );
    }

    fillYear($el, year);
  };

  //-----------------------------------------------------
  //First Section with basic info
  const fillFirstSection = () => {
    fill($id("countryDropdown"), resume.info.country);
    fill($id("legalNameSection_firstName"), resume.info.legalFirstName);
    fill($id("legalNameSection_lastName"), resume.info.legalLastName);
    fill($id("preferredNameCheckbox"), true, () => {
      fill($id("preferredNameSection_firstName"), resume.info.preferredFirstName);
      fill($id("preferredNameSection_lastName"), resume.info.preferredLastName);
    });
    fill($id("addressSection_addressLine1"), resume.info.address);
    fill($id("addressSection_city"), resume.info.city);
    fill($id("addressSection_countryRegion"), resume.info.state);
    fill($id("addressSection_postalCode"), resume.info.postalCode);
    fill($id("phone-device-type"), resume.info.phoneType);
    fill($id("phone-number"), resume.info.phoneNumber);
  };

  //-----------------------------------------------------
  //Second Section
  const fillSecondSection = async () => {
    return (
      new Promise((resolve) => {
        //Work Experience
        resume.workHistory.forEach((job, i) => {
          setTimeout(() => {
            click($(`button[aria-label="Add Work Experience"], button[aria-label="Add Another Work Experience"]`));
            setTimeout(() => {
              const $jobSection = $id(`workExperience-${i + 1}`);
              fill($idCtx($jobSection, "jobTitle"), job.title);
              fill($idCtx($jobSection, "company"), job.company);
              fill($idCtx($jobSection, "location"), job.location);
              fill($idCtx($jobSection, "currentlyWorkHere"), job.isCurrent);
              fillMonthAndYear($idCtx($jobSection, "formField-startDate"), job.startMonth, job.startYear);
              if (!job.isCurrent) {
                fillMonthAndYear($idCtx($jobSection, "formField-endDate"), job.endMonth, job.endYear);
              }
              fill($idCtx($jobSection, "description"), job.description);
              if (resume.workHistory.length - 1 === i) {
                resolve();
              }
            }, waitDelay);
          }, loopDelay * i);
        });
      })
        .then(() => {
          //Education but not the specific degree since they probably won't be in the list
          return new Promise((resolve) => {
            resume.education.forEach((edu, i) => {
              ((edu, i) => {
                setTimeout(() => {
                  click($(`button[aria-label="Add Education"], button[aria-label="Add Another Education"]`));
                  ((edu, i) => {
                    setTimeout(() => {
                      const $eduSection = $id(`education-${i + 1}`);
                      fill($idCtx($eduSection, "school"), edu.schoolName);
                      fill($idCtx($eduSection, "gpa"), edu.gpa);
                      fill($idCtx($eduSection, "degree"), edu.degreeType);

                      const $startDate = $idCtx($eduSection, "formField-startDate");
                      if ($startDate) {
                        fillYear($startDate, edu.startYear);
                      }

                      const $endDate = $idCtx($eduSection, "formField-endDate");
                      if ($endDate) {
                        fillYear($endDate, edu.endYear);
                      }

                      if (resume.education.length - 1 === i) {
                        resolve();
                      }
                    }, waitDelay);
                  })(edu, i);
                }, loopDelay * i);
              })(edu, i);
            });
          });
        })
        .then(() => {
          //Languages
          return new Promise((resolve) => {
            const $addLangBtn = $(`button[aria-label="Add Languages"], button[aria-label="Add Another Languages"]`);
            if ($addLangBtn) {
              resume.languages.forEach((lang, i) => {
                ((lang, i) => {
                  setTimeout(() => {
                    click($addLangBtn);
                    ((lang, i) => {
                      setTimeout(() => {
                        const $eduSection = $id(`language-${i + 1}`);
                        fill($idCtx($eduSection, "language"), lang.name);
                        fill($idCtx($eduSection, "nativeLanguage"), lang.isFluent);
                        fill($idCtx($eduSection, "languageProficiency-0"), lang.comprehension);
                        fill($idCtx($eduSection, "languageProficiency-1"), lang.overall);
                        fill($idCtx($eduSection, "languageProficiency-2"), lang.reading);
                        fill($idCtx($eduSection, "languageProficiency-3"), lang.speaking);
                        fill($idCtx($eduSection, "languageProficiency-4"), lang.writing);

                        if (resume.languages.length - 1 === i) {
                          resolve();
                        }
                      }, waitDelay);
                    })(lang, i);
                  }, loopDelay * i);
                })(lang, i);
              });
            } else {
              resolve();
            }
          });
        })
        .then(() => {
          //Websites/URLs
          return new Promise((resolve) => {
            resume.urls.forEach((url, i) => {
              setTimeout(() => {
                click($(`button[aria-label="Add Websites"], button[aria-label="Add Another Websites"]`));
                setTimeout(() => {
                  const $urlSection = $id(`websitePanelSet-${i + 1}`);
                  fill($urlSection.querySelector("input"), url);

                  if (resume.urls.length - 1 === i) {
                    resolve();
                  }
                }, waitDelay);
              }, loopDelay * i);
            });
          });
        })
    );
  };

  const fillDemographics = () => {
    fill($id("ethnicityDropdown"), resume.demographics.ethnicity);
    fill($id("gender"), resume.demographics.gender);
    fill($id("hispanicOrLatino"), resume.demographics.hispanicOrLatino);
    fill($id("veteranStatus"), resume.demographics.veteran);

    //These might be on another page
    fill($id("name"), `${resume.info.preferredFirstName} ${resume.info.preferredLastName}`);
    //Click the calendar icon and then the current date button
    click($idCtx($id("formField-todaysDate"), "dateIcon"));
    click($id("datePickerSelectedToday"));
  };

  //-----------------------------------------------------
  //Add buttons on the UI
  setTimeout(() => {
    const localBtnClass = $id("bottom-navigation-next-button").getAttribute("class");
    const headerStyles = getComputedStyle($id("header").querySelector("header"));

    const makeButton = (text, clickFn) => {
      const btn = document.createElement("button");
      btn.setAttribute("type", "button");
      btn.setAttribute("class", localBtnClass);
      btn.innerText = text;
      btn.addEventListener("click", clickFn);
      return btn;
    };

    const btnContainer = document.createElement("div");
    btnContainer.appendChild(makeButton("Auto-Fill First Section", fillFirstSection));
    btnContainer.appendChild(makeButton("Auto-Fill Second Section", fillSecondSection));
    btnContainer.appendChild(makeButton("Auto-Fill Demographics", fillDemographics));

    btnContainer.style.position = "fixed";
    btnContainer.style.right = 0;
    btnContainer.style.top = headerStyles.height;
    btnContainer.style.zIndex = 2; //one below the error messages
    btnContainer.style.display = "flex";
    btnContainer.style.flexDirection = "column";
    btnContainer.style.padding = ".5rem";
    btnContainer.style.gap = ".5rem";
    btnContainer.style.backgroundColor = headerStyles.backgroundColor;
    btnContainer.style.boxShadow = headerStyles.boxShadow;
    document.body.appendChild(btnContainer);
  }, 2500);
})();

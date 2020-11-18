### What did you change? 
#### Summary :speech_balloon:
<!-- insert a quick description of what you changed below this line -->
Some changes were made.

#### List of Changes :zap:
<!-- changes-begin (do no remove this line) -->
```
[fix]->         the login button now works
[feat]->        addded a new button to logout
[lang]->        added the Dutch language.
[lang(fix)]->   Fixed a typo in the German translation
```
<!-- changes-end (do not remove this line -->

#### Checklist :white_check_mark:
- [ ] Changes put in the list above (replace example, leave code tags and comments)
- [ ] Proper label(s) assigned to this pull request (check guide below)
- [ ] Appey (the AppCompany.io bot) created a correct changelog
- [ ] All checks came back succesful

> just check off the checklist and Appey will automatically merge and close this Pull Request.

##### Change Label Guide :newspaper:
```
In order to get the automated systems to know what changed 
you need to use the labels below in the list of changes. 

one change per line and always follow the following template:
[<label>]-> <message>

| label    | aliases         | version bump | description                                               
| -------- | --------------- | ------------ | -----------
| fix      | bug, bugfix     | patch        | fixed a previous feature with unwanted behavior           
| feature  | feat            | minor        | added a new feature to the app                            
| change   | refactor        | minor        | changed the behavior of a previous feature                
| lang     | language        | minor        | added support for a new language or improved translations   
| meta     | metadata        | patch        | updated metadata for the app (category, screenshots, etc.)
| docs     | doc             | -            | modified internal documentation                           
| ci       | buildsystem     | -            | changes were made to the CI/CD setup                      
| test     | tests, testing  | -            | made changes to the testing of the app                    
| chore    | -               | -            | other repository related changes

Make sure to also add all applicable labels to the pull request.
```
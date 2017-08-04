'use babel';

import { CompositeDisposable } from 'atom';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import FileHound from 'filehound';

export default {

  subscriptions: null,
  configFile: null,
  projectPath: atom.workspace.project.rootDirectories[0].path,
  filesToWatch: null,

  activate(state) {

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'gobasic-js-composer:toggle': () => this.toggle()
    }));

    this.watchFiles();

  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return
  },

  NotificationMessage(message){
    let content = `GOBasic JS Compiler - ${message}`;
    return content;
  },

  getConfigFile(){
    const files = FileHound.create()
      .paths(this.projectPath)
      .ext('config')
      .find()
      .then(files => {
        if(_.isEmpty(files)){
          atom.notifications.addError(this.NotificationMessage('No config file found!'))
          return
        }
        this.configFile = files[0];
        this.toggle();
      })
  },

  getJSFilesToWatch(){
    const filesJS = FileHound.create()
      .paths(this.projectPath+'/_shared/js')
      .ext('js')
      .find()
      .then(filesJS => {
        if(_.isEmpty(filesJS)){
          atom.notifications.addError(this.NotificationMessage('No config file found!'))
          return
        }
        this.filesToWatch = filesJS;
        this.watchFiles();
      })
  },

  watchFiles(){
    const self = this;
    if(this.filesToWatch === null){
      this.getJSFilesToWatch();
      return
    }

    _.forEach(this.filesToWatch, function(file){
      fs.watchFile(file, (curr, prev) => {
        self.toggle();
      });
    })

  },


  toggle() {

    if(this.configFile === null){
      this.getConfigFile();
      return
    }

    projectPath = this.projectPath;



    var configFile = fs.createReadStream(this.configFile);
    var obj = JSON.parse(fs.readFileSync(configFile.path, 'utf8')); // all options

    _.forEach(obj.themes, function(value){
      let jsFile = path.normalize(`${projectPath}/${value.name}/js/concat.js`);
      fs.writeFileSync(jsFile, '') // delete content of combined file

      if(value.scripts !== 'all'){

          _.forEach(value.scripts, function(script){
            // selected files content
            let tmp_script = fs.createReadStream(path.normalize(projectPath+'/_shared/js/'+obj.scripts[script]));
            let script_content = fs.readFileSync(tmp_script.path, 'utf8');
            fs.appendFileSync(jsFile, script_content);
          })


      }else{
        _.forEach(obj.scripts, function(script){
          // selected files content
          let tmp_script = fs.createReadStream(path.normalize(projectPath+'/_shared/js/'+script));
          let script_content = fs.readFileSync(tmp_script.path, 'utf8');
          fs.appendFileSync(jsFile, script_content);
        })
      }


    })

    atom.notifications.addSuccess(this.NotificationMessage('Files combined successfully'))

  }

};

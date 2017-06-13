import {Meteor} from 'meteor/meteor'
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tasks } from '../../lib/collections.js';
import '../templates/tasks.html';

Template.taskCol.onCreated(function bodyOnCreated()
{this.state = new ReactiveDict();
});

Template.taskCol.helpers({
  tasks() {
    const instance = Template.instance();
    if (instance.state.get('hideCompleted')){
      return Tasks.find({checked: { $ne : true} }, {sort: {createdAt:-1} });
    }
    return Tasks.find({}, {sort:{createdAt: -1}});
  },
  incompleteCount(){
    return Tasks.find({checked:{$ne:true}}).count();
  },
});


Template.taskCol.events({
  'submit .new-task'(event){
    event.preventDefault();

    const target = event.target;
    const text = target.text.value;

    Tasks.insert({
      text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username,
    });

    target.text.value= '';
  },
    'change .hide-completed input'(event, instance){
      instance.state.set('hideCompleted', event.target.checked);
  },
});
Template.task.events({
  'click .toggle-checked'(){
    if (Meteor.user().username == this.username || Roles.userIsInRole( Meteor.userId(), 'admin' )){
    Tasks.update(this._id, {
    $set: { checked: ! this.checked },
  });
  }
},
  'click .delete'(){
    if (Roles.userIsInRole( Meteor.userId(), 'admin' )){
    Tasks.remove(this._id);
  }
  },
});

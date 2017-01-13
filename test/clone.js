var expect = require('chai').expect;
var Q = require('q');
var ObjectTemplate = require('../index.js');

var Main = ObjectTemplate.create('Main', {
    name: {type: String, value: ''},
    init: function (name) {this.name = name;}
});

var SubOne = ObjectTemplate.create('SubOne', {
    name: {type: String, value: ''},
    init: function (name) {this.name = name;}
});

var SubOneA = SubOne.extend("SubOneA", {});
var SubOneB = SubOne.extend("SubOneB", {});

var SubMany = ObjectTemplate.create('SubMany', {
    main: {type: Main},
    name: {type: String, value: ''},
    init: function (name) {this.name = name;}
});
var SubManyA = SubMany.extend("SubManyA", {});
var SubManyB = SubMany.extend("SubManyB", {});

var SubManyExtended = SubMany.extend('SubManyExtended', {});

Main.mixin({
    subA: {type: SubOne},
    subB: {type: SubOne},
    subsA: {type: Array, of: SubMany, value: []},
    subsB: {type: Array, of: SubMany, value: []},
    addSubManyA: function (subMany) {
        subMany.main = this;
        this.subsA.push(subMany);
    },
    addSubManyB: function (subMany) {
        subMany.main = this;
        this.subsB.push(subMany);
    }
});

var main = new Main('main');
main.subA = new SubOneA('mainOneA');
main.subB = new SubOneB('mainOneB');
main.addSubManyA(new SubMany('mainManyA'));
main.addSubManyB(new SubManyA('mainManyBA'));
main.addSubManyB(new SubManyB('mainManyBB'));

it('can clone', function () {
    var relationship;
    var calledForTopLeve = false;
    var main2 = main.createCopy(function (obj, prop, template) {
        console.log(template.__name__);
        switch (template.__name__) {
        case 'Main':
            calledForTopLevel = true;
            return null; // Clone normally
        case 'SubManyExtended': // Never enters because we reference the base type
            return undefined; // Never clone
        }
        switch (obj.__template__.__name__ + '.' + prop) {
        case 'Main.subA': return undefined;
        case 'Main.subsA':
            return undefined;
        }

        return null;    // normal create process
    });

    expect(main2.subA).to.equal(null);
    expect(main2.subB.name).to.equal('mainOneB');
    expect(main2.subsB[0].name).to.equal('mainManyA');
    expect(main2.subsB[1].name).to.equal('mainManyBA');
    expect(main2.subsB[2].name).to.equal('mainManyBB');
    expect(main2.subsA.length).to.equal(0); // Because we
    expect(main2.subsB.length).to.equal(2); // Because we
    expect(main2.subA).to.equal(null);
});

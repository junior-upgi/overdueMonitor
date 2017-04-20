import chai, { expect } from 'chai';
import 'es6-promise/auto';

import app from './app.vue';

chai.should();

describe('App component test', () => {
    it('check if it has correct name set', () => {
        expect(app.name).to.be.eql('app');
    });
});

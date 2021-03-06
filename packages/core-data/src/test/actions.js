/**
 * Internal dependencies
 */
import { saveEntityRecord, receiveEntityRecords, receiveUserPermission, receiveAutosaves, receiveCurrentUser } from '../actions';

describe( 'saveEntityRecord', () => {
	it( 'triggers a POST request for a new record', async () => {
		const post = { title: 'new post' };
		const entities = [ { name: 'post', kind: 'postType', baseURL: '/wp/v2/posts' } ];
		const fulfillment = saveEntityRecord( 'postType', 'post', post );
		// Trigger generator
		fulfillment.next();
		// Provide entities and trigger apiFetch
		expect( fulfillment.next( entities ).value.type ).toBe(
			'SAVE_ENTITY_RECORD_START'
		);
		const { value: apiFetchAction } = fulfillment.next();
		expect( apiFetchAction.request ).toEqual( {
			path: '/wp/v2/posts',
			method: 'POST',
			data: post,
		} );
		// Provide response and trigger action
		const { value: received } = fulfillment.next( { ...post, id: 10 } );
		expect( received ).toEqual( receiveEntityRecords( 'postType', 'post', { ...post, id: 10 }, undefined, true ) );
		expect( fulfillment.next().value.type ).toBe( 'SAVE_ENTITY_RECORD_FINISH' );
	} );

	it( 'triggers a PUT request for an existing record', async () => {
		const post = { id: 10, title: 'new post' };
		const entities = [ { name: 'post', kind: 'postType', baseURL: '/wp/v2/posts' } ];
		const fulfillment = saveEntityRecord( 'postType', 'post', post );
		// Trigger generator
		fulfillment.next();
		// Provide entities and trigger apiFetch
		expect( fulfillment.next( entities ).value.type ).toBe(
			'SAVE_ENTITY_RECORD_START'
		);
		const { value: apiFetchAction } = fulfillment.next();
		expect( apiFetchAction.request ).toEqual( {
			path: '/wp/v2/posts/10',
			method: 'PUT',
			data: post,
		} );
		// Provide response and trigger action
		const { value: received } = fulfillment.next( post );
		expect( received ).toEqual( receiveEntityRecords( 'postType', 'post', post, undefined, true ) );
		expect( fulfillment.next().value.type ).toBe( 'SAVE_ENTITY_RECORD_FINISH' );
	} );

	it( 'triggers a PUT request for an existing record with a custom key', async () => {
		const postType = { slug: 'page', title: 'Pages' };
		const entities = [ { name: 'postType', kind: 'root', baseURL: '/wp/v2/types', key: 'slug' } ];
		const fulfillment = saveEntityRecord( 'root', 'postType', postType );
		// Trigger generator
		fulfillment.next();
		// Provide entities and trigger apiFetch
		expect( fulfillment.next( entities ).value.type ).toBe(
			'SAVE_ENTITY_RECORD_START'
		);
		const { value: apiFetchAction } = fulfillment.next();
		expect( apiFetchAction.request ).toEqual( {
			path: '/wp/v2/types/page',
			method: 'PUT',
			data: postType,
		} );
		// Provide response and trigger action
		const { value: received } = fulfillment.next( postType );
		expect( received ).toEqual( receiveEntityRecords( 'root', 'postType', postType, undefined, true ) );
		expect( fulfillment.next().value.type ).toBe( 'SAVE_ENTITY_RECORD_FINISH' );
	} );
} );

describe( 'receiveUserPermission', () => {
	it( 'builds an action object', () => {
		expect( receiveUserPermission( 'create/media', true ) ).toEqual( {
			type: 'RECEIVE_USER_PERMISSION',
			key: 'create/media',
			isAllowed: true,
		} );
	} );
} );

describe( 'receiveAutosaves', () => {
	it( 'builds an action object', () => {
		const postId = 1;
		const autosaves = [
			{
				content: 'test 1',
			},
			{
				content: 'test 2',
			},
		];

		expect( receiveAutosaves( postId, autosaves ) ).toEqual( {
			type: 'RECEIVE_AUTOSAVES',
			postId,
			autosaves,
		} );
	} );

	it( 'converts singular autosaves into an array', () => {
		const postId = 1;
		const autosave = {
			content: 'test 1',
		};

		expect( receiveAutosaves( postId, autosave ) ).toEqual( {
			type: 'RECEIVE_AUTOSAVES',
			postId,
			autosaves: [ autosave ],
		} );
	} );
} );

describe( 'receiveCurrentUser', () => {
	it( 'builds an action object', () => {
		const currentUser = { id: 1 };
		expect( receiveCurrentUser( currentUser ) ).toEqual( {
			type: 'RECEIVE_CURRENT_USER',
			currentUser,
		} );
	} );
} );

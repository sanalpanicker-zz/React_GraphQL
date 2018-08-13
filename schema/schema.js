const graphql = require('graphql');
const _ = require('lodash');
const a = require('axios');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    //as there is a circular dependency, wrapping it in a closure
    fields: () => ({
        id: {
            type: GraphQLString
        },
        name: {
            type: GraphQLString
        },
        description: {
            type: GraphQLString
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(ParentValue, args) {
                console.log(ParentValue, args);
                return a.get(`http://localhost:3000/companies/${ParentValue.id}/users`).then((r) => r.data);
            }
        }
    })
})

const UserType = new GraphQLObjectType({
    name: 'User',
    //as there is a circular dependency, wrapping it in a closure
    fields: () => ({
        id: {
            type: GraphQLString
        },
        firstName: {
            type: GraphQLString
        },
        age: {
            type: GraphQLInt
        },
        company: {
            type: CompanyType,
            resolve(ParentValue, args) {
                return a.get(`http://localhost:3000/companies/${ParentValue.companyId}`).then((r) => r.data);
            }
        }
    })
})


const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: {
                id: {
                    type: GraphQLString
                }
            },
            // es6 resolve : function () {}
            resolve(ParentValue, args) {
                //console.log(ParentValue, args);
                // we need to return the data as axios always wraps its respose in a data property.
                return a.get(`http://localhost:3000/users/${args.id}`).then((r) => r.data);
            }
        },
        company: {
            type: CompanyType,
            args: {
                id: {
                    type: GraphQLString
                }
            },
            // es6 resolve : function () {}
            resolve(ParentValue, args) {
                //console.log(ParentValue, args);
                // we need to return the data as axios always wraps its respose in a data property.
                return a.get(`http://localhost:3000/companies/${args.id}`).then((r) => r.data);
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        
        adduser: {
            type: UserType,
            args: {
                firstName: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                age: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
                companyId: {
                    type: GraphQLString
                }
            },
            //deconstructing args param
            resolve(ParentValue, {
                firstName,
                age
            }) {
                return a.post('http://localhost:3000/users', {
                    firstName,
                    age
                }).then((res) => res.data);
            }
        },

        deleteUser: {
            type: UserType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve(ParentValue, args) {
                return a.delete(`http://localhost:3000/users/${args.id}`).then((res) => res.data);
            }
        },

        updateUser: {
            type: UserType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                firstName: {
                    type: GraphQLString
                },
                age: {
                    type: GraphQLInt
                },
                companyId: {
                    type: GraphQLString
                }
            },
            resolve(ParentValue,
                args
            ) {
                console.log(ParentValue, args);
                return a.patch(`http://localhost:3000/users/${args.id}`,
                   args
                ).then((res) => res.data);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});
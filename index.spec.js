const { name } = require('faker');

const { processor } = require('.');

describe('compiler', () => {
  it('processes with env keys properly', (done) => {
    const item = {
      uat: name.firstName(),
      pre: name.firstName(),
    };

    processor(item, { environments: ['dev', 'prod'] }).then((res) => {
      expect(res[0]).toMatchObject({
        uat: item.uat,
        pre: item.pre,
      });
      done();
    });
  });

  it('processes arrays properly', (done) => {
    const item = {
      uat: ['hello'],
      pre: ['halo'],
    };

    processor(item, { environments: ['dev', 'prod'] }).then((res) => {
      expect(res[0]).toMatchObject({
        uat: item.uat,
        pre: item.pre,
      });
      expect(Array.isArray(res[0].uat)).toBe(true);
      done();
    });
  });

  it('does not use an env that does not exist', (done) => {
    const item = {
      test: name.firstName(),
    };

    processor(item, { environments: ['dev', 'prod'] }).then((res) => {
      expect(res[0]).not.toMatchObject({
        test: item.test,
      });
      done();
    });
  });

  it('handles super nesting properly', (done) => {
    const item = {
      min: {
        max: {
          minAgain: {
            maxAgain: {
              uat: '1',
              pre: '2',
              prod: '3',
            },
          },
        },
      },
    };
    processor(item, { environments: ['dev', 'prod'] }).then((res) => {
      expect(res[0].uat.min.max.minAgain.maxAgain).toBe(item.min.max.minAgain.maxAgain.uat);
      done();
    });
  });
});
